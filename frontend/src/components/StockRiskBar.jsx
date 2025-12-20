import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function StockRiskBar({ data }) {
    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#64b5f6" />
            </BarChart>
        </ResponsiveContainer>
    );
}
