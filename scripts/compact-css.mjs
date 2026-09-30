import postcss from 'postcss';

// Formatting only: never merge rules, rewrite values/selectors, subset fonts,
// or remove the Style Settings comment. Authoring files stay readable.
export function compactCss(source) {
  const root = postcss.parse(source);
  root.walkComments(node => {
    if (!node.text.startsWith('Quiet Paper ') && !node.text.startsWith('@settings')) node.remove();
  });
  root.walk(node => {
    // Preserve lint-friendly line breaks while removing indentation.
    const first = node === node.parent.first;
    node.raws.before = first ? (node.parent.type === 'root' ? '' : '\n') : (node.type === 'decl' ? '\n' : '\n\n');
    if (node.type === 'decl') node.raws.between = ':';
    if (node.nodes) {
      node.raws.between = '';
      node.raws.after = '\n';
    }
  });
  root.raws.after = '\n';
  return root.toString();
}
