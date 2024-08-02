export default function drawCircle(
  x: number,
  y: number,
  width: number,
  height: number,
  canvas: HTMLCanvasElement,
): void {
  if (!canvas) {
    console.error('Canvas element is not provided.');
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    console.error('Canvas context could not be obtained.');
    return;
  }

  context.beginPath();
  context.arc(x * width, y * height, 20, 0, 2 * Math.PI); // Drawing a circle with radius 50
  context.fillStyle = 'blue';
  context.fill();
  context.stroke();
}
