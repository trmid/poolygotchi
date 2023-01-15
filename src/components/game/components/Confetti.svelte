<!-- Module -->
<script type="ts">

  export let originX = 0.5;
  export let originY = 0.5;

  // Build confetti:
  let confettiSVG = "";
  for(let i = 0; i < 200; i++) {
    const colors = [0x512BC7, 0x40F99B, 0xF5FBEF];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const colorStr = "#" + (color | 0x666666).toString(16);
    const x = 0.01 + Math.random() * (1 - 0.02);
    const y = 0.01 + Math.random() * (1 - 0.02);
    confettiSVG += `
    <g>
      <rect x="0" y="0" width="0.02" height="0.01" fill="${colorStr}">
        <animate
          attributeType="XML"
          attributeName="height"
          begin="-${Math.random()}s"
          values="0.01;0;0.01"
          dur="0.3s"
          repeatCount="indefinite" />
        <animate
          attributeType="XML"
          attributeName="fill"
          values="${colorStr};#${(Math.floor(color / 4) | 0x222222).toString(16)};${colorStr}"
          dur="0.3s"
          repeatCount="indefinite" />
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          values="0 0.01 0;${0.01 + Math.random() * 60} 0.01 0;-${0.01 + Math.random() * 60} 0.01 0;0 0.01 0"
          dur="${0.1 + Math.random() * 0.5}s"
          repeatCount="indefinite" />
      </rect>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="translate"
        begin="0s"
        end="0.5s"
        dur="0.5s"
        values="${originX} ${originY};${x} ${y}"
        calcMode="spline"
        keySplines="0.1 0.8 0.2 1"/>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="translate"
        begin="0.5s"
        from="${x} ${y}"
        to="${x} ${2}"
        dur="${5 + Math.random() * 5}s"/>
    </g>`;
  }
</script>

<svg
  id="confetti"
  viewBox="0 0 1 1"
  xmlns="http://www.w3.org/2000/svg"
  version="1.1"
>
  {@html confettiSVG}
</svg>

<style>
svg#confetti {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  user-select: none;
  pointer-events: none;
  min-width: 100%;
  min-height: 100%;
  animation: 4s 1 forwards fade;
}
</style>