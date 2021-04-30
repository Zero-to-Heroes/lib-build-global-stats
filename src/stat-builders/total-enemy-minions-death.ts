import { extractTotalMinionDeaths, Replay } from '@firestone-hs/hs-replay-xml-parser/dist/public-api';
import { GlobalStat } from '../model/global-stat';
import { ReviewMessage } from '../review-message';
import { buildContexts } from '../utils/context-builder';
import { StatBuilder } from './_stat-builder';

export class TotalEnemyMinionsDeathBuilder implements StatBuilder {
	public async extractStat(message: ReviewMessage, replay: Replay): Promise<readonly GlobalStat[]> {
		const minionDeath = extractTotalMinionDeaths(replay);
		const contexts = buildContexts(replay);
		return contexts.map(
			context =>
				({
					statKey: 'total-enemy-minions-death',
					value: minionDeath.opponent,
					statContext: context,
				} as GlobalStat),
		);
	}
}
