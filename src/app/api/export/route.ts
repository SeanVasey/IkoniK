import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/apiAuth';

type ExportFormat = 'svg' | 'png' | 'jsx';

interface ExportRequestBody {
  svg: string;
  format: ExportFormat;
  sizes?: number[];
}

const SVG_ATTR_MAP: Record<string, string> = {
  'class': 'className',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  'font-size': 'fontSize',
  'font-family': 'fontFamily',
  'font-weight': 'fontWeight',
  'font-style': 'fontStyle',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'dominant-baseline': 'dominantBaseline',
  'alignment-baseline': 'alignmentBaseline',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'pointer-events': 'pointerEvents',
  'shape-rendering': 'shapeRendering',
  'image-rendering': 'imageRendering',
  'marker-start': 'markerStart',
  'marker-mid': 'markerMid',
  'marker-end': 'markerEnd',
  'xmlns:xlink': 'xmlnsXlink',
};

const VALID_FORMATS: ExportFormat[] = ['svg', 'png', 'jsx'];

/**
 * Converts an SVG string to a React JSX functional component.
 * Replaces hyphenated SVG attributes with their camelCase JSX equivalents.
 */
function svgToJsx(svg: string): string {
  let jsxContent = svg;

  for (const [svgAttr, jsxAttr] of Object.entries(SVG_ATTR_MAP)) {
    // Match attribute names in opening tags, avoiding replacement inside
    // attribute values or text content.
    const pattern = new RegExp(`\\b${svgAttr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=`, 'g');
    jsxContent = jsxContent.replace(pattern, `${jsxAttr}=`);
  }

  return `import type { SVGProps } from 'react';

export default function SvgIcon(props: SVGProps<SVGSVGElement>) {
  return (
    ${jsxContent.replace('<svg', '<svg {...props}')}
  );
}
`;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth();
  if (auth.userId === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: ExportRequestBody;
  try {
    body = (await request.json()) as ExportRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { svg, format } = body;

  if (!svg || typeof svg !== 'string') {
    return NextResponse.json(
      { error: 'Missing required field: svg' },
      { status: 400 },
    );
  }

  if (!format || !VALID_FORMATS.includes(format)) {
    return NextResponse.json(
      { error: `Invalid format. Allowed: ${VALID_FORMATS.join(', ')}` },
      { status: 400 },
    );
  }

  switch (format) {
    case 'svg':
      return NextResponse.json({ output: svg, format: 'svg' });

    case 'jsx':
      return NextResponse.json({ output: svgToJsx(svg), format: 'jsx' });

    case 'png':
      return NextResponse.json(
        { error: 'PNG export not yet implemented' },
        { status: 501 },
      );

    default: {
      // Exhaustive check
      const _exhaustive: never = format;
      return NextResponse.json(
        { error: `Unsupported format: ${String(_exhaustive)}` },
        { status: 400 },
      );
    }
  }
}
