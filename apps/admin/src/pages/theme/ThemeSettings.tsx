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
  Tabs,
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

  const { data: activeTheme } = useQuery({
    queryKey: ['active-theme'],
    queryFn: async () => {
      const response: any = await api.get('/themes/active');
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
      showToast('success', '主题更新成功！');
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['active-theme'] });
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.error || '更新失败');
    },
  });

  const handleSaveVariables = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTheme) {
      updateMutation.mutate({
        id: selectedTheme.id,
        data: { cssVariables },
      });
    }
  };

  const handleActivateTheme = (themeId: string) => {
    updateMutation.mutate({
      id: themeId,
      data: { isActive: true },
    });
  };

  if (isLoading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主题列表 */}
        <Card padding="lg" className="bg-white border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">可用主题</h3>
          <div className="space-y-3">
            {themes?.map((theme: any) => (
              <div
                key={theme.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  theme.isActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTheme(theme)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{theme.displayName}</h4>
                  {theme.isActive && <Badge variant="success">当前</Badge>}
                </div>
                <p className="text-sm text-gray-600 mb-3">{theme.name}</p>
                {!theme.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={e => {
                      e.stopPropagation();
                      handleActivateTheme(theme.id);
                    }}
                  >
                    激活主题
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 主题配置 */}
        <Card padding="lg" className="lg:col-span-2 bg-white border border-gray-200">
          {selectedTheme ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTheme.displayName}</h3>
                  <p className="text-sm text-gray-600">自定义 CSS 变量</p>
                </div>
                {selectedTheme.isActive && <Badge variant="success">当前激活</Badge>}
              </div>

              <Form onSubmit={handleSaveVariables}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(cssVariables).map(([key, value]) => (
                    <FormItem key={key} label={key}>
                      <div className="flex gap-2">
                        <Input
                          type={key.includes('color') ? 'color' : 'text'}
                          value={value}
                          onChange={e =>
                            setCssVariables({
                              ...cssVariables,
                              [key]: e.target.value,
                            })
                          }
                        />
                        {key.includes('color') && (
                          <Input
                            type="text"
                            value={value}
                            onChange={e =>
                              setCssVariables({
                                ...cssVariables,
                                [key]: e.target.value,
                              })
                            }
                            className="w-32"
                          />
                        )}
                      </div>
                    </FormItem>
                  ))}
                </div>

                <FormActions>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTheme(null);
                      setCssVariables({});
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? '保存中...' : '保存配置'}
                  </Button>
                </FormActions>
              </Form>

              {/* 预览 */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">预览效果</h4>
                <div
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: cssVariables['--color-bg'],
                    color: cssVariables['--color-text'],
                  }}
                >
                  <h5
                    className="text-xl font-bold mb-2"
                    style={{ color: cssVariables['--color-primary'] }}
                  >
                    示例标题
                  </h5>
                  <p className="mb-4">这是一段示例文本，用于预览主题效果。</p>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded"
                      style={{
                        backgroundColor: cssVariables['--color-primary'],
                        color: '#fff',
                        borderRadius: cssVariables['--border-radius'],
                      }}
                    >
                      主要按钮
                    </button>
                    <button
                      className="px-4 py-2 rounded border"
                      style={{
                        borderColor: cssVariables['--color-primary'],
                        color: cssVariables['--color-primary'],
                        borderRadius: cssVariables['--border-radius'],
                      }}
                    >
                      次要按钮
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              请从左侧选择一个主题进行配置
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
