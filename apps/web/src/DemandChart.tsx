import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type DemandPoint = { day: string; workshop: number; machinery: number }

export default function DemandChart({ data }: { data: DemandPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="workshop-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b91c9" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#6b91c9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="machinery-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8198b8" stopOpacity={0.23} />
            <stop offset="100%" stopColor="#8198b8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#263448" strokeDasharray="3 5" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={9} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid #304057', background: '#111925', color: '#e7edf6', fontSize: 12 }} />
        <Area type="monotone" dataKey="workshop" name="Taller" stroke="#6b91c9" strokeWidth={2.5} fill="url(#workshop-fill)" />
        <Area type="monotone" dataKey="machinery" name="Maquinaria" stroke="#8198b8" strokeWidth={2} fill="url(#machinery-fill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}