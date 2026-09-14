import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { shuffle } from "../common/utils/array.util"
import { makeUUID } from "../common/utils/id.util"
import { CardColors, CardData, CardTypes } from "../common/types"

/**
 * Deck composition is intentionally NOT standard UNO math - it is ported
 * exactly from the original CardService. Two stacks, each stack has one of
 * every {0-9, block, buy-2, reverse} per color, plus 2 black buy-4 and 2
 * black change-color wilds. Do not "fix" this.
 */
@Injectable()
export class CardService {
	private readonly cardTypes: CardTypes[] = [
		"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
		"block",
		"buy-2",
		"reverse",
	]

	private readonly cardColors: CardColors[] = [
		"blue",
		"green",
		"red",
		"yellow",
	]

	constructor (private readonly configService: ConfigService) {}

	async setupRandomCards (): Promise<CardData[]> {
		const randomCards: CardData[] = [
			...await this.getCardStack(),
			...await this.getCardStack(),
		]

		shuffle(randomCards)

		return randomCards
	}

	async retrieveRandomCardColor (): Promise<CardColors> {
		const cardColors: CardColors[] = ["blue", "green", "yellow", "red"]

		shuffle(cardColors)

		return cardColors[0]
	}

	async getCardStack (): Promise<CardData[]> {
		const cardStack: CardData[] = []

		this.cardTypes.forEach(cardType => {
			this.cardColors.forEach(cardColor => {
				cardStack.push({
					id: makeUUID(),
					src: this.buildCardPictureSrc(cardType, cardColor),
					name: `${cardType}-${cardColor}`,
					color: cardColor,
					type: cardType,
				})
			})
		})

		for (let i = 0; i < 2; i++) {
			cardStack.push(this.buildWildCard("buy-4"))
		}

		for (let i = 0; i < 2; i++) {
			cardStack.push(this.buildWildCard("change-color"))
		}

		return cardStack
	}

	private buildWildCard (cardType: "buy-4" | "change-color"): CardData {
		return {
			id: makeUUID(),
			src: this.buildCardPictureSrc(cardType, "black"),
			name: cardType,
			color: "black",
			type: cardType,
			selectedColor: null,
			possibleColors: {
				red: this.buildCardPictureSrc(cardType, "red"),
				blue: this.buildCardPictureSrc(cardType, "blue"),
				yellow: this.buildCardPictureSrc(cardType, "yellow"),
				green: this.buildCardPictureSrc(cardType, "green"),
				black: this.buildCardPictureSrc(cardType, "black"),
			},
		}
	}

	buildCustomCard (cardType: CardTypes, cardColor: CardColors): CardData {
		if (cardType === "buy-4" || cardType === "change-color") {
			return this.buildWildCard(cardType)
		}

		return {
			id: makeUUID(),
			src: this.buildCardPictureSrc(cardType, cardColor),
			name: `${cardType}-${cardColor}`,
			color: cardColor,
			type: cardType,
		}
	}

	private buildCardPictureSrc (cardType: CardTypes, cardColor: CardColors): string {
		const baseUrl = this.configService.get<string>("STATIC_FILES_BASE_URL", "")

		return `${baseUrl}/cards/${cardType}/${cardColor}.svg`
	}
}
