import { Bar, BarChart, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Seg', uv: 400 },
  { name: 'Ter', uv: 300 },
  { name: 'Qua', uv: 300 },
  { name: 'Qui', uv: 200 },
  { name: 'Sex', uv: 278 },
  { name: 'Sab', uv: 189 },
];

const margin = {
  top: 20,
  right: 30,
  left: 20,
  bottom: 25,
};

export default function Graphic() {
  return (
    <BarChart width={600} height={300} data={data} margin={margin}>
      <XAxis dataKey="name" />
      <YAxis />
      <Bar dataKey="uv" fill="#10B981" radius={[4, 4, 0, 0]} />
    </BarChart>
  );
}
