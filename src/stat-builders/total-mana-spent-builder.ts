import { extractTotalManaSpent, Replay } from '@firestone-hs/hs-replay-xml-parser/dist/public-api';
import { GlobalStat } from '../model/global-stat';
import { ReviewMessage } from '../review-message';
import { buildContexts } from '../utils/context-builder';
import { StatBuilder } from './_stat-builder';

export class TotalManaSpentBuilder implements StatBuilder {
	public async extractStat(message: ReviewMessage, replay: Replay): Promise<readonly GlobalStat[]> {
		if (message.gameMode === 'battlegrounds') {
			return [];
		}
		const totalManaSpent = extractTotalManaSpent(replay);
		const contexts = buildContexts(replay);
		return contexts.map(
			context =>
				({
					statKey: 'total-mana-spent',
					value: totalManaSpent.player,
					statContext: context,
				} as GlobalStat),
		);
	}
}
