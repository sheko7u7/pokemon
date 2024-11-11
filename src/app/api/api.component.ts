import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { db, Pokemon } from '../pokemon-indexeddb.service';

@Component({
  selector: 'app-api',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.css']
})
export class ApiComponent implements OnInit {
  pokemons: any[] = [];

  ngOnInit() {
    this.fetchPokemons();
  }

  async fetchPokemons() {
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon/?limit=100');
      const pokemonUrls = response.data.results.map((pokemon: { url: string }) => pokemon.url);

      const requests = pokemonUrls.map((url: string) => axios.get(url));
      const detailedPokemons = await Promise.all(requests);

      // Procesa cada Pokémon y guarda su imagen en IndexedDB
      for (const pokemon of detailedPokemons) {
        const pokemonData = pokemon.data;
        const imageUrl = pokemonData.sprites.front_default;

        if (imageUrl) {
          await this.savePokemonToIndexedDb(pokemonData.id, pokemonData.name, imageUrl);
        }
      }

      this.pokemons = detailedPokemons.map(pokemon => pokemon.data);
    } catch (error) {
      console.error('Error fetching Pokémon data', error);
    }
  }

  async savePokemonToIndexedDb(id: number, name: string, imageUrl: string) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const pokemon: Pokemon = { id, name, image: base64data };
      await db.savePokemon(pokemon);
    };

    reader.readAsDataURL(blob);
  }

  getPokemonTypeClass(pokemon: any): string {
    const type = pokemon.types[0].type.name.toLowerCase();
    switch (type) {
      case 'fire':
        return 'fire-type';
      case 'water':
        return 'water-type';
      case 'grass':
        return 'grass-type';
      case 'poison':
        return 'poison-type';
      case 'electric':
        return 'electric-type';
      case 'bug':
        return 'bug-type';
      case 'fairy':
        return 'fairy-type';
      case 'fighting':
        return 'fighting-type';
      case 'psychic':
        return 'psychic-type';
      case 'rock':
        return 'rock-type';
      case 'ghost':
        return 'ghost-type';
      case 'ground':
        return 'ground-type';
      default:
        return 'default-type';
    }
  }

  convertHeightToMeters(height: number): number {
    return height / 10;
  }

  convertWeightToKg(weight: number): number {
    return weight / 10;
  }

  getTranslatedType(type: string): string {
    switch (type) {
      case 'fire':
        return 'Fuego';
      case 'water':
        return 'Agua';
      case 'grass':
        return 'Planta';
      case 'electric':
        return 'Eléctrico';
      case 'bug':
        return 'Bicho';
      case 'fairy':
        return 'Hada';
      case 'fighting':
        return 'Lucha';
      case 'psychic':
        return 'Psíquico';
      case 'rock':
        return 'Roca';
      case 'ghost':
        return 'Fantasma';
      case 'ground':
        return 'Tierra';
      case 'poison':
        return 'Veneno';
      default:
        return type;
    }
  }
}
