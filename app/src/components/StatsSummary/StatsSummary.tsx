// React
import { ReactElement } from 'react';

// Custom
import { Stats } from '../../utils/getStatsFromLocalStorage';
import calculateWordsPerMinute from '../../utils/calculateWordsPerMinute';

// Styles
import './StatsSummary.css';

interface Props {
    stats: Stats;
}

const StatsSummary = ({ stats }: Props): ReactElement => {
    return (
        <div className="StatsSummary">
            <div className="recent">
                <div>
                    <span>Previous: </span>
                    <span>{stats.previous.toFixed(2)}wpm</span>
                </div>
                <div>
                    <span>High (today): </span>
                    <span>{stats.today.quoteRecords.sort((a, b) => b.wpm - a.wpm)[0]?.wpm.toFixed(2) || 0}wpm</span>
                </div>
            </div>
            <span className="divider" />
            <div className="aggregates">
                <div className="average">
                    <span>Average (all-time): </span>
                    <span>
                        {calculateWordsPerMinute(
                            { type: 'number', value: stats.totals.words },
                            stats.totals.ms,
                        ).toFixed(2)}
                        wpm
                    </span>
                </div>
                <div className="best-all-time">
                    <span>High (all-time): </span>
                    <span>
                        {Object.values(stats?.history || {})
                            ?.sort((a, b) => b.wpm - a.wpm)?.[0]
                            ?.wpm.toFixed(2) || 0}
                        wpm
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatsSummary;
