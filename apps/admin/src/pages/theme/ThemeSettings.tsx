import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Button,
  Input,
  Form,
  FormItem,
  FormActions,
  Badge,
  useToast,
  Loading,
} from '@blog/ui';
import api from '../../lib/axios';

export default function ThemeSettings() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});

  const { data: themes, isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const response: any = await api.get('/themes');
      return response.data;
    },
  });

  useEffect(() => {
    if (selectedTheme) {
      setCssVariables(selectedTheme.cssVariables);
    }
  }, [selectedTheme]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/themes/${id}`, data),
    onSuccess: () => {
      showToast('success', '主题更新成功');
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.error || '更新失败');
    },
  });

  const handleSaveVariables = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTheme) {
      updateMutation.mutate({ id: selectedTheme.id, data: { cssVariables } });
    }
  };

  const handleActivateTheme = (themeId: string) => {
    updateMutation.mutate({ id: themeId, data: { isActive: true } });
  };

  if (isLoading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 主题列表 */}
        <div className="bg-white border border-wechat-divider">
          <div className="px-4 py-3 border-b border-wechat-divider">
            <h3 className="text-sm font-semibold text-wechat-text">可用主题</h3>
          </div>
          <div className="divide-y divide-wechat-divider">
            {themes?.map((theme: any) => (
              <div
                key={theme.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedTheme?.id === theme.id
                    ? 'bg-wechat-bg border-l-2 border-wechat-link'
                    : 'hover:bg-wechat-bg'
                }`}
                onClick={() => setSelectedTheme(theme)}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-wechat-text">{theme.displayName}</h4>
                  {theme.isActive && <Badge variant="success">当前</Badge>}
                </div>
                <p className="text-xs text-wechat-subtext mb-2">{theme.name}</p>
                {!theme.isActive && (
                  <button
                    className="text-xs text-wechat-link hover:opacity-80"
                    onClick={e => {
                      e.stopPropagation();
                      handleActivateTheme(theme.id);
                    }}
                  >
                    激活主题
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 主题配置 */}
        <div className="lg:col-span-2 bg-white border border-wechat-divider">
          {selectedTheme ? (
            <>
              <div className="px-4 py-3 border-b border-wechat-divider flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-wechat-text">{selectedTheme.displayName}</h3>
                  <p className="text-xs text-wechat-subtext">自定义 CSS 变量</p>
                </div>
                {selectedTheme.isActive && <Badge variant="success">当前激活</Badge>}
              </div>

              <div className="p-4">
                <Form onSubmit={handleSaveVariables}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(cssVariables).map(([key, value]) => (
                      <FormItem key={key} label={key}>
                        <div className="flex gap-2">
                          <Input
                            type={key.includes('color') ? 'color' : 'text'}
                            value={value}
                            onChange={e =>
                              setCssVariables({ ...cssVariables, [key]: e.target.value })
                            }
                          />
                          {key.includes('color') && (
                            <Input
                              type="text"
                              value={value}
                              onChange={e =>
                                setCssVariables({ ...cssVariables, [key]: e.target.value })
                              }
                              className="w-32"
                            />
                          )}
                        </div>
                      </FormItem>
                    ))}
                  </div>

                  <FormActions>
                    <Button variant="outline" onClick={() => { setSelectedTheme(null); setCssVariables({}); }}>
                      取消
                    </Button>
                    <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? '保存中...' : '保存配置'}
                    </Button>
                  </FormActions>
                </Form>

                {/* 预览 */}
                <div className="mt-6 pt-4 border-t border-wechat-divider">
                  <h4 className="text-sm font-medium text-wechat-text mb-3">预览效果</h4>
                  <div
                    className="p-4 border border-wechat-divider"
                    style={{
                      backgroundColor: cssVariables['--color-bg'],
                      color: cssVariables['--color-text'],
                    }}
                  >
                    <h5 className="text-base font-bold mb-2" style={{ color: cssVariables['--color-primary'] }}>
                      示例标题
                    </h5>
                    <p className="text-sm mb-3">这是一段示例文本，用于预览主题效果。</p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 text-sm text-white"
                        style={{ backgroundColor: cssVariables['--color-primary'] }}
                      >
                        主要按钮
                      </button>
                      <button
                        className="px-3 py-1.5 text-sm border"
                        style={{ borderColor: cssVariables['--color-primary'], color: cssVariables['--color-primary'] }}
                      >
                        次要按钮
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-wechat-subtext text-sm">
              请从左侧选择一个主题进行配置
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
