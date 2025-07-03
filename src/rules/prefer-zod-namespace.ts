import { TSESTree } from "@typescript-eslint/utils";
import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name: string) =>
    `https://github.com/samchungy/eslint-plugin-import-zod/blob/main/docs/rules/${name}.md`
);

const getImportSource = (
  importedName: string,
  originalSource: string
): string => {
  return importedName === "core" && originalSource === "zod/v4"
    ? `${originalSource}/${importedName}`
    : originalSource;
};

const isAllSameSubmodule = (
  specifiers: TSESTree.ImportSpecifier[],
  targetName: string
): boolean => {
  return specifiers.every(
    (s) =>
      s.imported.type === TSESTree.AST_NODE_TYPES.Identifier &&
      s.imported.name === targetName
  );
};

export default createRule({
  name: "prefer-zod-namespace",
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce using namespace imports for zod",
    },
    fixable: "code", // This rule is automatically fixable
    schema: [], // No options
    messages: {
      preferNamespaceImport:
        'Import zod as a namespace (import * as z from "zod") instead of destructuring its exports',
    },
  },

  defaultOptions: [],

  create(context) {
    return {
      // Handle import declarations
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        // Only target imports from 'zod' or 'zod/*'
        if (
          node.source.value !== "zod" &&
          !node.source.value.startsWith("zod/")
        ) {
          return;
        }

        // Check if it's a named import (e.g., import { z } from 'zod')
        const namedSpecifiers = node.specifiers.filter(
          (specifier) =>
            specifier.type === TSESTree.AST_NODE_TYPES.ImportSpecifier
        );

        // If there are no named imports, there's nothing to check
        if (namedSpecifiers.length === 0) {
          return;
        }

        // Find 'z' or 'core' imports specifically
        const zodSpecifiers = namedSpecifiers.filter(
          (
            specifier: TSESTree.ImportSpecifier
          ): specifier is TSESTree.ImportSpecifier & {
            imported: TSESTree.Identifier;
          } =>
            specifier.imported.type === TSESTree.AST_NODE_TYPES.Identifier &&
            (specifier.imported.name === "z" ||
              specifier.imported.name === "core")
        );

        // If there's no 'z' or 'core' import, we don't need to do anything
        if (zodSpecifiers.length === 0) {
          return;
        }

        // Handle each zod specifier
        for (const zodSpecifier of zodSpecifiers) {
          // Get the local name of the import (in case it's renamed)
          const localName = zodSpecifier.local.name;
          const importedName = zodSpecifier.imported.name;
          const importSource = getImportSource(importedName, node.source.value);
          const isSubmoduleImport = importSource !== node.source.value;

          // Report the issue
          context.report({
            node: zodSpecifier,
            messageId: "preferNamespaceImport",
            fix(fixer) {
              // If this is the only specifier or all specifiers are for the same submodule
              if (
                namedSpecifiers.length === 1 ||
                (isSubmoduleImport &&
                  isAllSameSubmodule(namedSpecifiers, importedName))
              ) {
                // Simple case: just replace with a namespace import
                const isTypeOnlyImport = node.importKind === "type";
                const typePrefix = isTypeOnlyImport ? "type " : "";
                return fixer.replaceText(
                  node,
                  `import ${typePrefix}* as ${localName} from '${importSource}';`
                );
              } else {
                // Handle the case where we need to split imports
                const otherSpecifiers = namedSpecifiers.filter(
                  (s) => s !== zodSpecifier
                );

                // Check if this is a type-only import
                const isTypeOnlyImport = node.importKind === "type";

                // Create a namespace import for the zod specifier
                const typePrefix = isTypeOnlyImport ? "type " : "";
                const namespaceImport = `import ${typePrefix}* as ${localName} from '${importSource}';\n`;

                // Create a new import for the other specifiers
                const originalSource = node.source.value;
                const otherImport = `import ${
                  isTypeOnlyImport ? "type " : ""
                }{ ${otherSpecifiers
                  .map((s) => {
                    const specifierLocalName = s.local.name;
                    const specifierImportedName =
                      s.imported.type === TSESTree.AST_NODE_TYPES.Identifier
                        ? s.imported.name
                        : "";
                    // Preserve individual type imports when not a type-only import
                    const typeModifier =
                      !isTypeOnlyImport && s.importKind === "type"
                        ? "type "
                        : "";
                    return specifierLocalName === specifierImportedName
                      ? `${typeModifier}${specifierImportedName}`
                      : `${typeModifier}${specifierImportedName} as ${specifierLocalName}`;
                  })
                  .join(", ")} } from '${originalSource}';`;

                // Replace the entire import declaration
                return fixer.replaceText(
                  node,
                  `${namespaceImport}${otherImport}`
                );
              }
            },
          });
        }
      },
    };
  },
});
