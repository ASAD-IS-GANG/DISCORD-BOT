import type { Message } from "discord.js";

interface JokeApiResponse {
  error: boolean;
  type: "single" | "twopart";
  joke?: string;
  setup?: string;
  delivery?: string;
  category: string;
}

export async function handleJoke(message: Message): Promise<void> {
  try {
    const res = await fetch(
      "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist,explicit",
    );

    if (!res.ok) {
      await message.reply("Couldn't fetch a joke right now. Try again later!");
      return;
    }

    const data = (await res.json()) as JokeApiResponse;

    if (data.error) {
      await message.reply("Couldn't fetch a joke right now. Try again later!");
      return;
    }

    if (data.type === "twopart" && data.setup && data.delivery) {
      await message.reply(`${data.setup}\n\n||${data.delivery}||`);
    } else if (data.type === "single" && data.joke) {
      await message.reply(data.joke);
    }
  } catch {
    await message.reply("Something went wrong fetching a joke. Try again!");
  }
}
