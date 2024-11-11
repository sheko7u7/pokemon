import Dexie, { Table } from 'dexie';

export interface Pokemon {
  id: number;
  name: string;
  image: string; // Esto almacenará la imagen en base64
}

export class PokemonIndexedDbService extends Dexie {
  pokemons!: Table<Pokemon>;

  constructor() {
    super('PokemonDatabase');
    this.version(1).stores({
      pokemons: 'id, name, image'
    });
  }

  async savePokemon(pokemon: Pokemon) {
    await this.pokemons.put(pokemon);
  }

  async getPokemon(id: number) {
    return await this.pokemons.get(id);
  }

  async getAllPokemons() {
    return await this.pokemons.toArray();
  }

  async fetchAndSavePokemonImage(pokemonId: number, name: string, imageUrl: string) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      await this.savePokemon({ id: pokemonId, name: name, image: base64data });
    };
    reader.readAsDataURL(blob);
  }
}

export const db = new PokemonIndexedDbService();
