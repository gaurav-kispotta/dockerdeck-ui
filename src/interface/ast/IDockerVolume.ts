export interface IDockerVolume {
    name: string;
    driver: string;
    driver_opts: {
        [key: string]: string;
    };
}