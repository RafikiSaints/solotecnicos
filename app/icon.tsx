import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1E3A8A',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '30%',
            background: '#EF4444',
          }}
        />
        <div
          style={{
            color: 'white',
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1,
            marginLeft: 6,
          }}
        >
          ★
        </div>
      </div>
    ),
    size
  )
}
