import { Replay } from '@firestone-hs/hs-replay-xml-parser/dist/public-api';
import {
	DALARAN_HEIST_ALL,
	GameFormat,
	GameType,
	PRACTICE_ALL,
	TOMBS_OF_TERROR_ALL,
} from '@firestone-hs/reference-data';
import { StatContext } from '../model/context.type';

export const buildContext = (replay: Replay): StatContext => {
	switch (replay.gameType) {
		case GameType.GT_ARENA:
			return 'arena';
		case GameType.GT_FSG_BRAWL:
		case GameType.GT_FSG_BRAWL_1P_VS_AI:
		case GameType.GT_FSG_BRAWL_2P_COOP:
		case GameType.GT_FSG_BRAWL_VS_FRIEND:
		case GameType.GT_TAVERNBRAWL:
		case GameType.GT_TB_1P_VS_AI:
		case GameType.GT_TB_2P_COOP:
			return 'tavern-brawl';
		case GameType.GT_BATTLEGROUNDS:
		case GameType.GT_BATTLEGROUNDS_FRIENDLY:
			return 'battlegrounds';
		case GameType.GT_VS_AI:
			if (PRACTICE_ALL.includes(replay.scenarioId)) {
				return 'practice';
			} else if (DALARAN_HEIST_ALL.includes(replay.scenarioId)) {
				return 'dalaran-heist';
			} else if (TOMBS_OF_TERROR_ALL.includes(replay.scenarioId)) {
				return 'tombs-of-terror';
			}
			return 'adventure';
		case GameType.GT_RANKED:
			switch (replay.gameFormat) {
				case GameFormat.FT_STANDARD:
					return 'standard-ranked';
				case GameFormat.FT_WILD:
				default:
					return 'wild-ranked';
			}
		case GameType.GT_CASUAL:
			switch (replay.gameFormat) {
				case GameFormat.FT_STANDARD:
					return 'standard-casual';
				case GameFormat.FT_WILD:
				default:
					return 'wild-casual';
			}
		case GameType.GT_VS_FRIEND:
			switch (replay.gameFormat) {
				case GameFormat.FT_STANDARD:
					return 'standard-friendly';
				case GameFormat.FT_WILD:
				default:
					return 'wild-friendly';
			}
	}
	return 'unknown';
};

export const buildContexts = (replay: Replay): readonly StatContext[] => {
	return ['global', buildContext(replay)];
};
