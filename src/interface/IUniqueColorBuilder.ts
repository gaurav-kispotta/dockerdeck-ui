export interface IUniqueColorBuilder {
    /**
     * Generates a unique color based on the provided input.
     * @param input A string or number used to generate the unique color.
     * @returns A string representing the unique color in hexadecimal format.
     */
    generateUniqueColor(input: string | number): string;

    /**
     * Resets the internal state of the color builder, if any.
     */
    reset(): void;

    /**
     * Checks if a color has already been generated for the given input.
     * @param input A string or number to check.
     * @returns A boolean indicating whether a color exists for the input.
     */
    hasColor(input: string | number): boolean;
}