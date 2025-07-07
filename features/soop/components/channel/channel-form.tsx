"use client";

import { useForm } from "react-hook-form";
import { useEffect, useCallback } from "react";
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

  const handleDelete = useCallback(() => {
    if (channel && onDelete) {
      if (confirm(`"${channel.label}" 채널을 삭제하시겠습니까?`)) {
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
        <label htmlFor="channelLabel" className="block text-sm font-medium mb-1">
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
          {mode === "edit" && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            >
              삭제
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mode === "create" ? "생성" : "수정"}
          </button>
        </div>
      </div>
    </form>
  );
};