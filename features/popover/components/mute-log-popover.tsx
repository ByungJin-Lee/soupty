"use client";

import {
  PopoverContentProps,
  PopoverId,
  withPopover,
} from "~/common/ui/popover";
import { formatTimestamp } from "~/common/utils/format";
import { MuteLogPopoverPayload } from "../types/mute-log";

const MuteLogPopoverContent: React.FC<
  PopoverContentProps<MuteLogPopoverPayload>
> = ({ payload }) => {
  return (
    <div className="p-3 min-w-[200px]">
      <table>
        <thead>
          <tr>
            <th>일시</th>
            <th>관리자</th>
          </tr>
        </thead>
        <tbody>
          {payload.logs.map((v, i) => (
            <tr key={i} className="border-b border-gray-300">
              <td className="border-r border-gray-300 pr-2">
                {formatTimestamp(v.timestamp)}
              </td>
              <td className="pl-2">{v.by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const MuteLogPopover = withPopover(
  MuteLogPopoverContent,
  PopoverId.MuteLog
);
