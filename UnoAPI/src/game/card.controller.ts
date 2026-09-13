import { Controller, Get } from "@nestjs/common"

import { CardService } from "./card.service"

@Controller("cards")
export class CardController {
	constructor (private readonly cardService: CardService) {}

	@Get()
	async getCardList () {
		const cards = await this.cardService.getCardStack()

		const cardList = cards.map(card => ({ src: card.src }))

		return { cards: cardList }
	}
}
