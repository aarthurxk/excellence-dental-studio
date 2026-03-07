import { motion } from "framer-motion";
import SectionDivider from "./SectionDivider";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const schedule = [
  { time: "08:00 – 09:00", entries: ["Dr. Silva — Clínico Geral", "Dra. Costa — Ortodontia", "Dr. Alves — Endodontia", "Dra. Lima — Pediatria", "Dr. Silva — Clínico Geral", "Dra. Costa — Ortodontia"] },
  { time: "09:00 – 10:00", entries: ["Dra. Rocha — Implantes", "Dr. Mendes — Periodontia", "Dra. Costa — Ortodontia", "Dr. Silva — Clínico Geral", "Dra. Rocha — Implantes", "Dr. Mendes — Periodontia"] },
  { time: "10:00 – 11:00", entries: ["Dr. Alves — Endodontia", "Dra. Lima — Pediatria", "Dr. Mendes — Periodontia", "Dra. Rocha — Implantes", "Dr. Alves — Endodontia", "—"] },
  { time: "11:00 – 12:00", entries: ["Dra. Lima — Pediatria", "Dr. Silva — Clínico Geral", "Dra. Rocha — Implantes", "Dr. Alves — Endodontia", "Dra. Lima — Pediatria", "—"] },
  { time: "14:00 – 15:00", entries: ["Dr. Mendes — Periodontia", "Dra. Rocha — Implantes", "Dr. Silva — Clínico Geral", "Dra. Costa — Ortodontia", "Dr. Mendes — Periodontia", "—"] },
  { time: "15:00 – 16:00", entries: ["Dra. Costa — Ortodontia", "Dr. Alves — Endodontia", "Dra. Lima — Pediatria", "Dr. Mendes — Periodontia", "Dra. Costa — Ortodontia", "—"] },
  { time: "16:00 – 17:00", entries: ["Dr. Silva — Clínico Geral", "Dra. Lima — Pediatria", "Dr. Alves — Endodontia", "Dr. Silva — Clínico Geral", "Dr. Silva — Clínico Geral", "—"] },
  { time: "17:00 – 18:00", entries: ["Dra. Rocha — Implantes", "Dr. Mendes — Periodontia", "Dra. Costa — Ortodontia", "Dra. Lima — Pediatria", "Dra. Rocha — Implantes", "—"] },
];

const TimetableSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Horários de Atendimento</h2>
          <div className="flex justify-center"><SectionDivider /></div>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Confira os horários dos nossos profissionais durante a semana.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-x-auto rounded-lg border border-border shadow-sm"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="text-secondary-foreground font-bold text-center min-w-[120px]">Horário</TableHead>
                {days.map((day) => (
                  <TableHead key={day} className="text-secondary-foreground font-bold text-center min-w-[160px]">{day}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((row, i) => {
                const isHighlighted = i % 2 === 1;
                return (
                  <TableRow
                    key={row.time}
                    className={`transition-all duration-200 hover:shadow-md ${
                      isHighlighted ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                    }`}
                  >
                    <TableCell className={`font-semibold text-center text-sm ${isHighlighted ? "text-primary-foreground" : "text-foreground"}`}>
                      {row.time}
                    </TableCell>
                    {row.entries.map((entry, j) => (
                      <TableCell key={j} className={`text-center text-sm ${isHighlighted ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        {entry !== "—" ? (
                          <span className={isHighlighted ? "font-semibold" : ""}>{entry}</span>
                        ) : (
                          <span className="opacity-40">—</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </section>
  );
};

export default TimetableSection;
