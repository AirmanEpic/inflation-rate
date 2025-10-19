"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { FinancialSimPlural, FinancialSimSingular } from "@/components/financialSim";

export default function Home() {
  return (
    <FinancialSimPlural />
  );
}
