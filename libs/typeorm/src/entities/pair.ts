import { Column, PrimaryColumn, Entity, Check } from "typeorm";

@Entity("pairs", { schema: "public" })
@Check('"number" >= 1 AND "number" <= 6')
@Check('"day" >= 1 AND "day" <= 6')
export class Pair {
  @PrimaryColumn("text", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("integer", { name: "name", nullable: false })
  name: string;

  @Column("integer", {
    name: "number",
    nullable: false,
  })
  number: number;

  @Column("integer", {
    name: "day",
    nullable: false,
  })
  day: number;

  @Column("text", {
    name: "group_name",
    nullable: false,
  })
  group_name: string;

  @ManyToOne(() => Faculty, (faculty: Faculty) => faculty.)
  faculty_id: number;
}


