import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Controller('health')
export class HealthController {

    constructor(private config: ConfigService) {}

    @Get()
    getHealth() {
        return { status: 'OK' };
    }

    @Get('fcheck')
    async getFCheck() {
        const pokeApiUrl = this.config.getOrThrow("POKEAPI_URL");
        const {ok, message} = await fetch(pokeApiUrl + 'pokemon/1')
            .then(res => ({ok:res.ok, message: res.statusText}))
            .catch(() => ({ok:false, message: 'Failed to fetch'})); 

        return { status: ok ? 'OK' : 'FAILED', message };
    }

}
