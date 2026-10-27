import layers from "@/data/layers.json";
import companies from "@/data/companies.json";
import signals from "@/data/signals.json";
import directions from "@/data/directions.json";
import careers from "@/data/careers.json";
import type { CareerRow, Company, Direction, Layer, Signal } from "./types";

export type MapData = {
  layers: Layer[];
  companies: Company[];
  signals: Signal[];
  directions: Direction[];
  careers: CareerRow[];
};

export const mapData: MapData = {
  layers: layers as Layer[],
  companies: companies as Company[],
  signals: signals as Signal[],
  directions: directions as Direction[],
  careers: careers as CareerRow[],
};
