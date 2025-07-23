import { WordCount } from "~/services/ipc/types";

type Props = {
  popularWords: WordCount[];
};

export const PopularWordsTable: React.FC<Props> = ({ popularWords }) => {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm mr-2">
          🔥
        </span>
        인기 단어
      </h4>
      {popularWords.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider w-16">
                  순위
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider w-32">
                  단어
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-green-700 uppercase tracking-wider w-24">
                  빈도
                </th>
                <th className="px-2 py-3 border-l border-green-200 w-4"></th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider w-16">
                  순위
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider w-32">
                  단어
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-green-700 uppercase tracking-wider w-24">
                  빈도
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({
                length: Math.ceil(popularWords.length / 2),
              }).map((_, rowIndex) => {
                const leftIndex = rowIndex * 2;
                const rightIndex = leftIndex + 1;
                const leftWord = popularWords[leftIndex];
                const rightWord = popularWords[rightIndex];

                return (
                  <tr
                    key={`word-row-${rowIndex}`}
                    className="hover:bg-green-25 transition-colors"
                  >
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          leftIndex === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : leftIndex === 1
                            ? "bg-gray-100 text-gray-800"
                            : leftIndex === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {leftIndex + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm font-medium">
                        {leftWord.word}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {leftWord.count.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-2 border-l border-gray-200"></td>
                    <td className="px-4 py-3 text-center">
                      {rightWord && (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            rightIndex === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : rightIndex === 1
                              ? "bg-gray-100 text-gray-800"
                              : rightIndex === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {rightIndex + 1}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {rightWord && (
                        <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm font-medium">
                          {rightWord.word}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {rightWord ? rightWord.count.toLocaleString() : ""}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-center py-12">
          <div className="text-4xl mb-2">📝</div>
          <div className="font-medium">분석된 단어가 없습니다</div>
        </div>
      )}
    </div>
  );
};