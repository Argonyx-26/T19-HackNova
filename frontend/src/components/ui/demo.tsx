import RotatingEarth from "@/components/ui/wireframe-dotted-globe"

export default function DemoOne() {
  return (
    <div className="flex items-center justify-center p-8 bg-black/90 min-h-[600px] rounded-2xl border border-neutral-800">
      <RotatingEarth width={800} height={600} />
    </div>
  )
}
