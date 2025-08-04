"use client";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { confirm } from "~/common/stores/confirm-modal-store";
import { Button } from "~/common/ui";
import { Channel } from "~/types";

interface ChannelFormData {
  id: string;
  label: string;
}

interface ChannelFormProps {
  mode: "create" | "edit";
  channel?: Channel;
  onSubmit: (data: ChannelFormData) => void;
  onCancel: () => void;
  onDelete?: (channelId: string) => void;
}

export const ChannelForm: React.FC<ChannelFormProps> = ({
  mode,
  channel,
  onSubmit,
  onCancel,
  onDelete,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ChannelFormData>({
    mode: "onChange",
    defaultValues: {
      id: "",
      label: "",
    },
  });

  const handleDelete = useCallback(async () => {
    if (channel && onDelete) {
      if (
        await confirm(
          "채널 삭제",
          `"${channel.label}" 채널을 삭제하시겠습니까?`
        )
      ) {
        onDelete(channel.id);
      }
    }
  }, [channel, onDelete]);

  useEffect(() => {
    if (mode === "edit" && channel) {
      reset({
        id: channel.id,
        label: channel.label,
      });
    } else {
      reset({
        id: "",
        label: "",
      });
    }
  }, [mode, channel, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="channelId" className="block text-sm font-medium mb-1">
          채널 ID
        </label>
        <input
          id="channelId"
          type="text"
          disabled={mode === "edit"}
          placeholder="채널 ID를 입력하세요"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          {...register("id", {
            required: "채널 ID는 필수입니다",
            minLength: {
              value: 1,
              message: "채널 ID를 입력해주세요",
            },
          })}
        />
        {errors.id && (
          <p className="text-red-500 text-sm mt-1">{errors.id.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="channelLabel"
          className="block text-sm font-medium mb-1"
        >
          채널명
        </label>
        <input
          id="channelLabel"
          type="text"
          placeholder="채널명을 입력하세요"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("label", {
            required: "채널명은 필수입니다",
            minLength: {
              value: 1,
              message: "채널명을 입력해주세요",
            },
          })}
        />
        {errors.label && (
          <p className="text-red-500 text-sm mt-1">{errors.label.message}</p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <div>
          {mode === "edit" && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              className="bg-red-400 hover:bg-red-600"
            >
              삭제
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="border-0 bg-transparent"
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid}>
            {mode === "create" ? "생성" : "수정"}
          </Button>
        </div>
      </div>
    </form>
  );
};
