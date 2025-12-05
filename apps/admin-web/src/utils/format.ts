import { MathpixMarkdownModel as MM } from 'mathpix-markdown-it';

export const formatMarkdown = (content: string) => {
  const res = content.replace(/\$ /g, '$').replace(/ \$/g, '$');
  return MM.markdownToHTML(res, {
    outMath: {
      include_mathml: true,
      include_asciimath: true,
      include_latex: true,
      include_tsv: true,
    },
  });
};
