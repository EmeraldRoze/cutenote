// Torn-paper emoji art from the QuteNote brand kit (public/emoji/*.png).
// Use in place of standard emoji wherever a matching artwork exists.
export default function QEmoji({
  name,
  size = 28,
  style,
}: {
  name: string
  size?: number
  style?: React.CSSProperties
}) {
  return (
    <img
      src={`/emoji/${name}.png`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: '-0.18em', objectFit: 'contain', ...style }}
    />
  )
}
