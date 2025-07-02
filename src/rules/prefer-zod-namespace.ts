import { TSESTree } from "@typescript-eslint/utils";
import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name: string) =>
    `https://github.com/samchungy/eslint-plugin-import-zod/blob/main/docs/rules/${name}.md`
);

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
      preferNamespaceExport:
        "Export zod as a namespace instead of re-exporting destructured exports",
    },
  },

  defaultOptions: [],

  create(context) {
    return {
      // Handle import declarations
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        // Only target imports from 'zod'
        if (node.source.value !== "zod" && node.source.value !== "zod/v4") {
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

        // Find 'z' imports specifically
        const zSpecifier = namedSpecifiers.find(
          (specifier: TSESTree.ImportSpecifier) =>
            specifier.imported.type === TSESTree.AST_NODE_TYPES.Identifier &&
            specifier.imported.name === "z"
        );

        // If there's no 'z' import, we don't need to do anything
        if (!zSpecifier) {
          return;
        }

        // Get the local name of the import (in case it's renamed)
        const localName = zSpecifier.local.name;

        // Report the issue
        context.report({
          node: zSpecifier,
          messageId: "preferNamespaceImport",
          fix(fixer) {
            // If there are other named imports from 'zod', we need to handle them differently
            if (namedSpecifiers.length > 1) {
              const otherSpecifiers = namedSpecifiers.filter(
                (s: TSESTree.ImportSpecifier) => s !== zSpecifier
              );

              // Check if this is a type-only import
              const isTypeOnlyImport = node.importKind === "type";

              // Create a namespace import for 'z'
              const typePrefix = isTypeOnlyImport ? "type " : "";
              const importSource = node.source.value; // Preserve the original import source ('zod' or 'zod/v4')
              const namespaceImport = `import ${typePrefix}* as ${localName} from '${importSource}';\n`;

              // Create a new import for the other specifiers
              const otherImport = `import ${
                isTypeOnlyImport ? "type " : ""
              }{ ${otherSpecifiers
                .map((s: TSESTree.ImportSpecifier) => {
                  const localName = s.local.name;
                  const importedName =
                    s.imported.type === TSESTree.AST_NODE_TYPES.Identifier
                      ? s.imported.name
                      : "";
                  // Preserve individual type imports when not a type-only import
                  const typeModifier =
                    !isTypeOnlyImport && s.importKind === "type" ? "type " : "";
                  return localName === importedName
                    ? `${typeModifier}${importedName}`
                    : `${typeModifier}${importedName} as ${localName}`;
                })
                .join(", ")} } from '${importSource}';`;

              // Replace the entire import declaration
              return fixer.replaceText(
                node,
                `${namespaceImport}${otherImport}`
              );
            } else {
              // Simple case: just replace with a namespace import
              // Check if this is a type-only import
              const isTypeOnlyImport = node.importKind === "type";
              const typePrefix = isTypeOnlyImport ? "type " : "";
              const importSource = node.source.value; // Preserve the original import source ('zod' or 'zod/v4')
              return fixer.replaceText(
                node,
                `import ${typePrefix}* as ${localName} from '${importSource}';`
              );
            }
          },
        });
      },

      // Handle export declarations that re-export from zod
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        // Only target exports from 'zod' or 'zod/v4'
        if (
          !node.source ||
          (node.source.value !== "zod" && node.source.value !== "zod/v4")
        ) {
          return;
        }

        // If there's no specifiers, there's nothing to check
        if (!node.specifiers || node.specifiers.length === 0) {
          return;
        }

        // Check if it's a named export (e.g., export { z } from 'zod')
        const namedSpecifiers = node.specifiers.filter(
          (specifier) =>
            specifier.type === TSESTree.AST_NODE_TYPES.ExportSpecifier
        );

        // If there are no named exports, there's nothing to check
        if (namedSpecifiers.length === 0) {
          return;
        }

        // Find 'z' exports specifically
        const zSpecifier = namedSpecifiers.find(
          (specifier: TSESTree.ExportSpecifier) =>
            specifier.local.type === TSESTree.AST_NODE_TYPES.Identifier &&
            specifier.local.name === "z"
        );

        // If there's no 'z' export, we don't need to do anything
        if (!zSpecifier) {
          return;
        }

        // Report the issue
        context.report({
          node: zSpecifier,
          messageId: "preferNamespaceExport",
          fix(fixer) {
            // If there are other named exports from 'zod', we need to handle them differently
            if (namedSpecifiers.length > 1) {
              const otherSpecifiers = namedSpecifiers.filter(
                (s: TSESTree.ExportSpecifier) => s !== zSpecifier
              );

              // Create a namespace export for 'z'
              const exportedName =
                zSpecifier.exported.type === TSESTree.AST_NODE_TYPES.Identifier
                  ? zSpecifier.exported.name
                  : "";
              const exportSource = node.source.value; // Preserve the original source
              const namespaceExport = `export * as ${exportedName} from '${exportSource}';`;

              // Create a new export for the other specifiers
              const otherExport = `export { ${otherSpecifiers
                .map((s: TSESTree.ExportSpecifier) => {
                  const localName =
                    s.local.type === TSESTree.AST_NODE_TYPES.Identifier
                      ? s.local.name
                      : "";
                  const exportedName =
                    s.exported.type === TSESTree.AST_NODE_TYPES.Identifier
                      ? s.exported.name
                      : "";
                  return localName === exportedName
                    ? exportedName
                    : `${localName} as ${exportedName}`;
                })
                .join(", ")} } from '${exportSource}';`;

              // Replace the entire export declaration
              return fixer.replaceText(
                node,
                `${namespaceExport}\n${otherExport}`
              );
            } else {
              // Simple case: just replace with a namespace export
              const exportedName =
                zSpecifier.exported.type === TSESTree.AST_NODE_TYPES.Identifier
                  ? zSpecifier.exported.name
                  : "";
              const exportSource = node.source.value; // Preserve the original source
              return fixer.replaceText(
                node,
                `export * as ${exportedName} from '${exportSource}';`
              );
            }
          },
        });
      },
    };
  },
});
