import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function ChartComponent({ data, xKey, yKey }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Line dataKey={yKey} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
