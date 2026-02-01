import MaterialsClient from "./MaterialsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "المواد الدراسية",
};

export default function MaterialsPage() {
    return <MaterialsClient />;
}
