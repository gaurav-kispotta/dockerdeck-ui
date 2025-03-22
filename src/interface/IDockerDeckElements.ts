import { IDesignElement } from "./IDesignElements";

export interface IDockerDesignElements {
    elements: { [k: string]: IDesignElement[] }
}