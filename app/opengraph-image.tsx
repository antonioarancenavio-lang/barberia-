import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Cortia — Tu barbería. Tu agenda. Todo bajo control.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#17171A',
          padding: 80,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            border: '5px solid #FAF9F6',
            borderRightColor: 'transparent',
            marginBottom: 40,
          }}
        />
        <div style={{ fontSize: 64, color: '#FAF9F6', fontWeight: 600, display: 'flex' }}>Cortia</div>
        <div style={{ fontSize: 28, color: '#A39C8C', marginTop: 16, display: 'flex' }}>
          Tu barbería. Tu agenda. Todo bajo control.
        </div>
      </div>
    ),
    { ...size }
  );
}
