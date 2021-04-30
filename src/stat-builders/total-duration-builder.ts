import { extractTotalDuration, Replay } from '@firestone-hs/hs-replay-xml-parser/dist/public-api';
import { GlobalStat } from '../model/global-stat';
import { ReviewMessage } from '../review-message';
import { buildContexts } from '../utils/context-builder';
import { StatBuilder } from './_stat-builder';

export class TotalDurationBuilder implements StatBuilder {
	public async extractStat(message: ReviewMessage, replay: Replay): Promise<readonly GlobalStat[]> {
		const durationInSeconds = extractTotalDuration(replay);
		const durationInHours = (1.0 * durationInSeconds) / 3600;
		const formattedDuration = parseFloat(durationInHours.toFixed(2));
		const contexts = buildContexts(replay);
		return contexts.map(
			context =>
				({
					statKey: 'total-duration',
					value: formattedDuration,
					statContext: context,
				} as GlobalStat),
		);
	}
}
