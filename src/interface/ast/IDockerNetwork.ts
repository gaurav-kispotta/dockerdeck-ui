export interface IDockerNetwork {
    name: string;
    driver: string;
    ipam: {
        driver: string;
        config: {
            subnet: string;
            gateway: string;
        }[];
    };
}