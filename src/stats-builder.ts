/* eslint-disable @typescript-eslint/no-use-before-define */
import { parseHsReplayString, Replay } from '@firestone-hs/hs-replay-xml-parser/dist/public-api';
// import { fetch } from 'node-fetch';
// import { Rds } from './db/rds';
import { GlobalStat } from './model/global-stat';
import { GlobalStats } from './model/global-stats';
import { ReviewMessage } from './review-message';
import { TotalTavernLockAllBuilder } from './stat-builders/battlegrounds/total-tavern-lock-all-builder';
import { TotalTavernRerollBuilder } from './stat-builders/battlegrounds/total-tavern-reroll-builder';
import { TotalTavernUpgradeBuilder } from './stat-builders/battlegrounds/total-tavern-upgrade-builder';
import { BestBattlegroundsRankBuilder } from './stat-builders/best-rank-builder';
import { TotalDamageDealtToEnemyHeroBuilder } from './stat-builders/total-damage-dealt-to-enemy-hero-builder';
import { TotalDurationBuilder } from './stat-builders/total-duration-builder';
import { TotalEnemyHeroesKilled } from './stat-builders/total-enemy-heroes-killed';
import { TotalEnemyMinionsDeathBuilder } from './stat-builders/total-enemy-minions-death';
import { TotalManaSpentBuilder } from './stat-builders/total-mana-spent-builder';
import { TotalMinionsPlayedByTribe } from './stat-builders/total-minions-played-by-tribe-builder';
import { TotalNumberOfMatchesBuilder } from './stat-builders/total-number-of-matches-builder';
import { StatBuilder } from './stat-builders/_stat-builder';

class StatsBuilder {
	public static readonly statBuilders: readonly StatBuilder[] = StatsBuilder.initializeBuilders();

	private static initializeBuilders(): readonly StatBuilder[] {
		return [
			new TotalDamageDealtToEnemyHeroBuilder(),
			new TotalManaSpentBuilder(),
			new TotalEnemyMinionsDeathBuilder(),
			new TotalNumberOfMatchesBuilder(),
			new TotalDurationBuilder(),
			new BestBattlegroundsRankBuilder(),
			new TotalTavernUpgradeBuilder(),
			new TotalTavernLockAllBuilder(),
			new TotalTavernRerollBuilder(),
			new TotalEnemyHeroesKilled(),
			new TotalMinionsPlayedByTribe(),
		];
	}
}

export const extractStatsForGame = async (message: ReviewMessage, replayString: string): Promise<GlobalStats> => {
	const replay: Replay = parseHsReplayString(replayString);
	// console.log('parsed replay');
	const stats: readonly GlobalStat[] = (
		await Promise.all(StatsBuilder.statBuilders.map(builder => builder.extractStat(message, replay)))
	)
		.reduce((a, b) => a.concat(b), [])
		.filter(stat => stat && stat.value > 0);
	// console.log('build stats from game');
	const statsFromGame = Object.assign(new GlobalStats(), {
		stats: stats,
	} as GlobalStats);
	return statsFromGame;
};

export const buildChangedStats = (currentStats: GlobalStats, statsFromGame: GlobalStats): GlobalStats => {
	const uniqueKeys = [
		...new Set([
			...currentStats.stats.map(stat => stat.statKey + '|' + stat.statContext),
			...statsFromGame.stats.map(stat => stat.statKey + '|' + stat.statContext),
		]),
	];
	const newStats = uniqueKeys
		.map(key => {
			// console.log('handling key', key);
			const statKey = key.split('|')[0];
			const context = key.split('|')[1];
			const statFromGame: GlobalStat = statsFromGame.stats.find(
				stat => stat.statKey === statKey && stat.statContext === context,
			);
			// Don't update unchanged stats
			if (!statFromGame) {
				return null;
			}

			const statFromDb: GlobalStat = currentStats.stats.find(
				stat => stat.statKey === statKey && stat.statContext === context,
			);
			const valueFromDb = statFromDb ? statFromDb.value : 0;
			const mergedValue = statKey.startsWith('best')
				? valueFromDb >= statFromGame.value
					? null
					: statFromGame.value
				: valueFromDb + statFromGame.value;
			return mergedValue != null
				? Object.assign(new GlobalStat(), {
						id: (statFromDb || statFromGame).id,
						statKey: statKey,
						value: mergedValue,
						statContext: context,
				  } as GlobalStat)
				: null;
		})
		.filter(stat => stat);
	return Object.assign(new GlobalStats(), {
		stats: newStats,
	} as GlobalStats);
};

export const mergeStats = (currentStats: GlobalStats, statsFromGame: GlobalStats): GlobalStats => {
	const uniqueKeys = [
		...new Set([
			...currentStats.stats.map(stat => stat.statKey + '|' + stat.statContext),
			...statsFromGame.stats.map(stat => stat.statKey + '|' + stat.statContext),
		]),
	];
	const newStats = uniqueKeys
		.map(key => {
			// console.log('handling key', key);
			const statKey = key.split('|')[0];
			const context = key.split('|')[1];
			const statFromGame: GlobalStat = statsFromGame.stats.find(
				stat => stat.statKey === statKey && stat.statContext === context,
			);
			const existingStat: GlobalStat = currentStats.stats.find(
				stat => stat.statKey === statKey && stat.statContext === context,
			);
			const existingValue = existingStat ? existingStat.value : 0;
			const newValue = statFromGame ? statFromGame.value : 0;
			const mergedValue = statKey.startsWith('best')
				? Math.max(existingValue, newValue)
				: existingValue + newValue;
			return Object.assign(new GlobalStat(), {
				id: (existingStat || statFromGame).id,
				statKey: statKey,
				value: mergedValue,
				statContext: context,
			} as GlobalStat);
		})
		.filter(stat => stat);
	return Object.assign(new GlobalStats(), {
		stats: newStats,
	} as GlobalStats);
};
