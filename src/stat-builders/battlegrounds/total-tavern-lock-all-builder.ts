import { Replay } from '@firestone-hs/hs-replay-xml-parser/dist/public-api';
import { BlockType, GameTag } from '@firestone-hs/reference-data';
import { GlobalStat } from '../../model/global-stat';
import { ReviewMessage } from '../../review-message';
import { buildContext } from '../../utils/context-builder';
import { StatBuilder } from '../_stat-builder';

export class TotalTavernLockAllBuilder implements StatBuilder {
	public async extractStat(message: ReviewMessage, replay: Replay): Promise<readonly GlobalStat[]> {
		const context = buildContext(replay);
		if (context !== 'battlegrounds') {
			return [];
		}
		const lockCardIds = ['TB_BaconShopLockAll_Button'];
		const lockAllButtonIds = lockCardIds
			.map(cardId =>
				replay.replay.findall(`.//FullEntity[@cardID='${cardId}']`).map(entity => parseInt(entity.get('id'))),
			)
			.reduce((a, b) => a.concat(b), []);
		const lockAllBlocks = lockAllButtonIds
			.map(lockButtonEntityId =>
				replay.replay
					.findall(`.//Block[@entity='${lockButtonEntityId}'][@type='${BlockType.POWER}']`)
					.filter(block => block.findall(`.//TagChange[@tag='${GameTag.FROZEN}'][@value='1']`).length > 0),
			)
			.reduce((a, b) => a.concat(b), []).length;
		return [
			{
				statKey: 'total-tavern-lock-all',
				value: lockAllBlocks,
				statContext: context,
			} as GlobalStat,
		];
	}
}
