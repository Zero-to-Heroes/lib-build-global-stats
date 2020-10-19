export interface ReviewMessage {
	readonly reviewId: string;
	readonly replayKey: string;
	readonly uploaderToken: string;
	readonly gameMode: 'battlegrounds' | 'ranked' | string;
	readonly playerRank: string;
}
