import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function ExpiryDistributionChart({ data }) {
  const colors = ["#e53935", "#fb8c00", "#fdd835", "#43a047"];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <XAxis dataKey="range" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count">
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
