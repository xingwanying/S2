/* eslint-disable no-console */
import {
  Radio,
  Space,
  Switch,
  RadioChangeEvent,
  Tooltip,
  Select,
  Input,
  Popover,
  Slider,
  Button,
  Collapse,
  Tag,
  Tabs,
} from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  HeaderActionIconProps,
  S2Options,
  Node,
  S2DataConfig,
  TargetCellInfo,
  SpreadSheet,
  S2Event,
  TooltipAutoAdjustBoundary,
  customMerge,
  ThemeCfg,
  ViewMeta,
  S2Theme,
  DataType,
} from '@antv/s2';
import corePkg from '@antv/s2/package.json';
import { forEach, random } from 'lodash';
import { customTreeFields } from '../__tests__/data/custom-tree-fields';
import { dataCustomTrees } from '../__tests__/data/data-custom-trees';
import { mockGridAnalysisDataCfg } from '../__tests__/data/grid-analysis-data';
import {
  singleMeasure,
  multiMeasure,
  customTree,
} from '../__tests__/data/strategy-data';
import reactPkg from '../package.json';
import {
  pivotSheetDataCfg,
  sliderOptions,
  tableSheetDataCfg,
  defaultTheme,
  strategyOptions as mockStrategyOptions,
  mockGridAnalysisOptions,
  defaultOptions,
} from './config';
import { ResizeConfig } from './resize';
import {
  SheetComponent,
  SheetType,
  PartDrillDown,
  PartDrillDownInfo,
} from '@/components';

import './index.less';
import 'antd/dist/antd.min.css';
import '@antv/s2/esm/style.css';

const { TabPane } = Tabs;
const fieldMap = {
  channel: ['物美', '华联'],
  sex: ['男', '女'],
};

const partDrillDown: PartDrillDown = {
  drillConfig: {
    dataSet: [
      {
        name: '销售渠道',
        value: 'channel',
        type: 'text',
      },
      {
        name: '客户性别',
        value: 'sex',
        type: 'text',
      },
    ],
  },
  // drillItemsNum: 1,
  fetchData: (meta, drillFields) =>
    new Promise<PartDrillDownInfo>((resolve) => {
      // 弹窗 -> 选择 -> 请求数据
      const preDrillDownfield =
        meta.spreadsheet.store.get('drillDownNode')?.field;
      const dataSet = meta.spreadsheet.dataSet;
      const field = drillFields[0];
      const rowDatas = dataSet
        .getMultiData(meta.query, true, true, [preDrillDownfield])
        .filter(
          (item) => item.sub_type && item.type && item[preDrillDownfield],
        );
      console.log(rowDatas);
      const drillDownData: DataType[] = [];
      forEach(rowDatas, (data: DataType) => {
        const { number, sub_type: subType, type } = data;
        const number0 = random(50, number);
        const number1 = number - number0;
        const dataItem0 = {
          ...meta.query,
          number: number0,
          sub_type: subType,
          type,
          [field]: fieldMap[field][0],
        };
        drillDownData.push(dataItem0);
        const dataItem1 = {
          ...meta.query,
          number: number1,
          sub_type: subType,
          type,
          [field]: fieldMap[field][1],
        };

        drillDownData.push(dataItem1);
      });
      console.log(drillDownData);
      resolve({
        drillField: field,
        drillData: drillDownData,
      });
    }),
};

const CustomTooltip = () => (
  <div>
    自定义 Tooltip <div>1</div>
    <div>2</div>
  </div>
);

const CustomColTooltip = () => <div>custom colTooltip</div>;

const ActionIconTooltip = ({ name }) => <div>{name} Tooltip</div>;

function MainLayout() {
  const [render, setRender] = React.useState(true);
  const [sheetType, setSheetType] = React.useState<SheetType>('pivot');
  const [showPagination, setShowPagination] = React.useState(false);
  const [showTotals, setShowTotals] = React.useState(false);
  const [themeCfg, setThemeCfg] = React.useState<ThemeCfg>({ name: 'default' });
  const [showCustomTooltip, setShowCustomTooltip] = React.useState(false);
  const [adaptive, setAdaptive] = React.useState(false);
  const [options, setOptions] =
    React.useState<Partial<S2Options<React.ReactNode>>>(defaultOptions);
  const [dataCfg, setDataCfg] =
    React.useState<Partial<S2DataConfig>>(pivotSheetDataCfg);
  const [strategyDataCfg, setStrategyDataCfg] =
    React.useState<S2DataConfig>(customTree);
  const [strategyOptions, setStrategyOptions] =
    React.useState<S2Options>(mockStrategyOptions);
  const s2Ref = React.useRef<SpreadSheet>();

  //  ================== Callback ========================
  const updateOptions = (newOptions: Partial<S2Options<React.ReactNode>>) => {
    setOptions(customMerge({}, options, newOptions));
  };

  const updateDataCfg = (newDataCfg: Partial<S2DataConfig>) => {
    const currentDataCfg =
      sheetType === 'pivot' ? pivotSheetDataCfg : tableSheetDataCfg;

    setDataCfg(customMerge({}, currentDataCfg, newDataCfg));
  };

  const onAutoAdjustBoundary = (value: TooltipAutoAdjustBoundary) => {
    updateOptions({
      tooltip: {
        autoAdjustBoundary: value || null,
      },
    });
  };

  const onLayoutWidthTypeChange = (e: RadioChangeEvent) => {
    updateOptions({
      style: {
        layoutWidthType: e.target.value,
      },
    });
  };

  const onSizeChange = (type: 'width' | 'height') => (e) => {
    updateOptions({
      [type]: e.target.value,
    });
  };

  const onScrollSpeedRatioChange =
    (type: 'horizontal' | 'vertical') => (value: number) => {
      updateOptions({
        interaction: {
          scrollSpeedRatio: {
            [type]: value,
          },
        },
      });
    };

  const onToggleRender = () => {
    setRender(!render);
  };

  const onThemeChange = (e: RadioChangeEvent) => {
    setThemeCfg(
      customMerge({}, themeCfg, {
        name: e.target.value,
      }),
    );
  };

  const onSheetTypeChange = (e: RadioChangeEvent) => {
    setSheetType(e.target.value);
  };

  const logHandler =
    (name: string) => (cellInfo?: TargetCellInfo | ViewMeta) => {
      if (options.debug) {
        console.debug(name, cellInfo);
      }
    };

  const onColCellClick = (cellInfo: TargetCellInfo) => {
    logHandler('onColCellClick')(cellInfo);
    if (!options.showDefaultHeaderActionIcon) {
      const { event } = cellInfo;
      s2Ref.current.showTooltip({
        position: { x: event.clientX, y: event.clientY },
        content: <CustomColTooltip />,
      });
    }
  };

  //  ================== Hooks ========================

  React.useEffect(() => {
    s2Ref.current?.on(S2Event.DATA_CELL_TREND_ICON_CLICK, (meta) => {
      console.log('趋势图icon点击', meta);
    });
  }, [sheetType]);

  React.useEffect(() => {
    switch (sheetType) {
      case 'table':
        setDataCfg(tableSheetDataCfg);
        updateOptions(defaultOptions);
        break;
      default:
        setDataCfg(pivotSheetDataCfg);
        updateOptions(defaultOptions);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetType]);

  //  ================== Config ========================

  const mergedOptions: Partial<S2Options<React.ReactNode>> = customMerge(
    {},
    {
      width: 600,
      height: 400,
      hierarchyCollapse: false,
      pagination: showPagination && {
        pageSize: 10,
        current: 1,
      },
      tooltip: {
        content: showCustomTooltip ? <CustomTooltip /> : null,
      },
      totals: showTotals && {
        row: {
          showGrandTotals: true,
          showSubTotals: true,
          subTotalsDimensions: ['province'],
        },
        col: {
          showGrandTotals: true,
          showSubTotals: true,
          subTotalsDimensions: ['type'],
        },
      },
      customSVGIcons: !options.showDefaultHeaderActionIcon && [
        {
          name: 'Filter',
          svg: 'https://gw.alipayobjects.com/zos/antfincdn/gu1Fsz3fw0/filter%26sort_filter.svg',
        },
        {
          name: 'FilterAsc',
          svg: 'https://gw.alipayobjects.com/zos/antfincdn/UxDm6TCYP3/filter%26sort_asc%2Bfilter.svg',
        },
      ],
      headerActionIcons: !options.showDefaultHeaderActionIcon && [
        {
          iconNames: ['Filter'],
          belongsCell: 'colCell',
          displayCondition: (node: Node) =>
            node.id !== 'root[&]家具[&]桌子[&]number',
          action: (props: HeaderActionIconProps) => {
            const { meta, event } = props;
            meta.spreadsheet.tooltip.show({
              position: { x: event.clientX, y: event.clientY },
              content: <ActionIconTooltip name="Filter colCell" />,
            });
          },
        },
        {
          iconNames: ['SortDown'],
          belongsCell: 'colCell',
          displayCondition: (node: Node) =>
            node.id === 'root[&]家具[&]桌子[&]number',
          action: (props: HeaderActionIconProps) => {
            const { meta, event } = props;
            meta.spreadsheet.tooltip.show({
              position: { x: event.clientX, y: event.clientY },
              content: <ActionIconTooltip name="SortDown colCell" />,
            });
          },
        },
        {
          iconNames: ['FilterAsc'],
          belongsCell: 'cornerCell',
          action: (props: HeaderActionIconProps) => {
            const { meta, event } = props;
            meta.spreadsheet.tooltip.show({
              position: { x: event.clientX, y: event.clientY },
              content: <ActionIconTooltip name="FilterAsc cornerCell" />,
            });
          },
        },
        {
          iconNames: ['SortDown', 'Filter'],
          belongsCell: 'rowCell',
          action: (props: HeaderActionIconProps) => {
            const { meta, event } = props;
            meta.spreadsheet.tooltip.show({
              position: { x: event.clientX, y: event.clientY },
              content: <ActionIconTooltip name="SortDown & Filter rowCell" />,
            });
          },
        },
      ],
    },
    options,
  );

  const onStrategyDataTypeChange = (e: RadioChangeEvent) => {
    let newDataCfg;
    switch (e.target.value) {
      case 'multiMeasure':
        newDataCfg = multiMeasure;
        setStrategyOptions(
          customMerge({}, strategyOptions, { hierarchyType: 'tree' }),
        );
        break;
      case 'customTree':
        newDataCfg = customTree;
        setStrategyOptions(
          customMerge({}, strategyOptions, { hierarchyType: 'customTree' }),
        );
        break;
      default:
        newDataCfg = singleMeasure;
        setStrategyOptions(
          customMerge({}, strategyOptions, { hierarchyType: 'tree' }),
        );
        break;
    }
    setStrategyDataCfg(newDataCfg);
  };

  return (
    <div className="playground">
      <Tabs defaultActiveKey="strategy" type="card">
        <TabPane tab="基础表" key="basic">
          <Collapse defaultActiveKey="filter">
            <Collapse.Panel header="筛选器" key="filter">
              <Space>
                <Tooltip title="表格类型">
                  <Radio.Group
                    onChange={onSheetTypeChange}
                    defaultValue={sheetType}
                  >
                    <Radio.Button value="pivot">透视表</Radio.Button>
                    <Radio.Button value="table">明细表</Radio.Button>
                  </Radio.Group>
                </Tooltip>
                <Tooltip title="布局类型">
                  <Radio.Group
                    onChange={onLayoutWidthTypeChange}
                    defaultValue="adaptive"
                  >
                    <Radio.Button value="adaptive">行列等宽</Radio.Button>
                    <Radio.Button value="colAdaptive">列等宽</Radio.Button>
                    <Radio.Button value="compact">紧凑</Radio.Button>
                  </Radio.Group>
                </Tooltip>
                <Tooltip title="主题">
                  <Radio.Group onChange={onThemeChange} defaultValue="default">
                    <Radio.Button value="default">默认</Radio.Button>
                    <Radio.Button value="gray">简约灰</Radio.Button>
                    <Radio.Button value="colorful">多彩蓝</Radio.Button>
                  </Radio.Group>
                </Tooltip>
              </Space>
              <Space style={{ margin: '20px 0', display: 'flex' }}>
                <Tooltip title="tooltip 自动调整: 显示的tooltip超过指定区域时自动调整, 使其不遮挡">
                  <Select
                    defaultValue={mergedOptions.tooltip.autoAdjustBoundary}
                    onChange={onAutoAdjustBoundary}
                    style={{ width: 230 }}
                    size="small"
                  >
                    <Select.Option value="container">
                      container (表格区域)
                    </Select.Option>
                    <Select.Option value="body">
                      body (浏览器可视区域)
                    </Select.Option>
                    <Select.Option value="">关闭</Select.Option>
                  </Select>
                </Tooltip>
                <Input
                  style={{ width: 150 }}
                  onChange={onSizeChange('width')}
                  defaultValue={mergedOptions.width}
                  suffix="px"
                  prefix="宽度"
                  size="small"
                />
                <Input
                  style={{ width: 150 }}
                  onChange={onSizeChange('height')}
                  defaultValue={mergedOptions.height}
                  suffix="px"
                  prefix="高度"
                  size="small"
                />
                <Popover
                  placement="bottomRight"
                  content={
                    <>
                      <div style={{ width: '600px' }}>
                        水平滚动速率 ：
                        <Slider
                          {...sliderOptions}
                          defaultValue={
                            mergedOptions.interaction.scrollSpeedRatio
                              .horizontal
                          }
                          onChange={onScrollSpeedRatioChange('horizontal')}
                        />
                        垂直滚动速率 ：
                        <Slider
                          {...sliderOptions}
                          defaultValue={
                            mergedOptions.interaction.scrollSpeedRatio.vertical
                          }
                          onChange={onScrollSpeedRatioChange('vertical')}
                        />
                      </div>
                    </>
                  }
                >
                  <Button size="small" style={{ marginLeft: 20 }}>
                    滚动速率调整
                  </Button>
                </Popover>
              </Space>
              <Space
                style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap' }}
              >
                <Switch
                  checkedChildren="渲染组件"
                  unCheckedChildren="卸载组件"
                  defaultChecked={render}
                  onChange={onToggleRender}
                />
                <Switch
                  checkedChildren="调试模式开"
                  unCheckedChildren="调试模式关"
                  defaultChecked={mergedOptions.debug}
                  onChange={(checked) => {
                    updateOptions({ debug: checked });
                  }}
                />
                <Switch
                  checkedChildren="树形"
                  unCheckedChildren="平铺"
                  checked={mergedOptions.hierarchyType === 'tree'}
                  onChange={(checked) => {
                    updateOptions({
                      hierarchyType: checked ? 'tree' : 'grid',
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Tooltip title="树状模式生效">
                  <Switch
                    checkedChildren="收起子节点"
                    unCheckedChildren="展开子节点"
                    disabled={mergedOptions.hierarchyType !== 'tree'}
                    checked={mergedOptions.hierarchyCollapse}
                    onChange={(checked) => {
                      updateOptions({
                        hierarchyCollapse: checked,
                      });
                    }}
                  />
                </Tooltip>
                <Switch
                  checkedChildren="数值挂列头"
                  unCheckedChildren="数值挂行头"
                  defaultChecked={dataCfg.fields?.valueInCols}
                  onChange={(checked) => {
                    updateDataCfg({
                      fields: {
                        valueInCols: checked,
                      },
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Switch
                  checkedChildren="隐藏数值"
                  unCheckedChildren="显示数值"
                  defaultChecked={mergedOptions.style.colCfg.hideMeasureColumn}
                  onChange={(checked) => {
                    updateOptions({
                      style: {
                        colCfg: {
                          hideMeasureColumn: checked,
                        },
                      },
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Switch
                  checkedChildren="冻结行头开"
                  unCheckedChildren="冻结行头关"
                  defaultChecked={mergedOptions.frozenRowHeader}
                  onChange={(checked) => {
                    updateOptions({
                      frozenRowHeader: checked,
                    });
                  }}
                  disabled={sheetType === 'table'}
                />
                <Switch
                  checkedChildren="容器宽高自适应开"
                  unCheckedChildren="容器宽高自适应关"
                  defaultChecked={adaptive}
                  onChange={setAdaptive}
                />
                <Switch
                  checkedChildren="显示序号"
                  unCheckedChildren="不显示序号"
                  checked={mergedOptions.showSeriesNumber}
                  onChange={(checked) => {
                    updateOptions({
                      showSeriesNumber: checked,
                    });
                  }}
                />
                <Switch
                  checkedChildren="分页"
                  unCheckedChildren="不分页"
                  checked={showPagination}
                  onChange={setShowPagination}
                />
                <Switch
                  checkedChildren="汇总"
                  unCheckedChildren="无汇总"
                  checked={showTotals}
                  onChange={setShowTotals}
                />
                <Switch
                  checkedChildren="默认actionIcons"
                  unCheckedChildren="自定义actionIcons"
                  checked={mergedOptions.showDefaultHeaderActionIcon}
                  onChange={(checked) => {
                    updateOptions({
                      showDefaultHeaderActionIcon: checked,
                    });
                  }}
                />
                <Switch
                  checkedChildren="开启Tooltip"
                  unCheckedChildren="关闭Tooltip"
                  checked={mergedOptions.tooltip.showTooltip}
                  onChange={(checked) => {
                    updateOptions({
                      tooltip: {
                        showTooltip: checked,
                      },
                    });
                  }}
                />
                <Switch
                  checkedChildren="自定义Tooltip"
                  unCheckedChildren="默认Tooltip"
                  checked={showCustomTooltip}
                  onChange={setShowCustomTooltip}
                />
              </Space>
            </Collapse.Panel>
            <Collapse.Panel header="交互配置" key="interaction">
              <Space>
                <Switch
                  checkedChildren="选中聚光灯开"
                  unCheckedChildren="选中聚光灯关"
                  checked={mergedOptions.interaction.selectedCellsSpotlight}
                  onChange={(checked) => {
                    updateOptions({
                      interaction: {
                        selectedCellsSpotlight: checked,
                      },
                    });
                  }}
                />
                <Switch
                  checkedChildren="hover十字器开"
                  unCheckedChildren="hover十字器关"
                  checked={mergedOptions.interaction.hoverHighlight}
                  onChange={(checked) => {
                    updateOptions({
                      interaction: {
                        hoverHighlight: checked,
                      },
                    });
                  }}
                />
                <Switch
                  checkedChildren="hover聚焦开"
                  unCheckedChildren="hover聚焦关"
                  checked={mergedOptions.interaction.hoverFocus}
                  onChange={(checked) => {
                    updateOptions({
                      interaction: {
                        hoverFocus: checked,
                      },
                    });
                  }}
                />
                <Tooltip title="开启后,点击空白处,按下ESC键, 取消高亮, 清空选中单元格, 等交互样式">
                  <Switch
                    checkedChildren="自动重置交互样式开"
                    unCheckedChildren="自动重置交互样式关"
                    defaultChecked={
                      mergedOptions?.interaction?.autoResetSheetStyle
                    }
                    onChange={(checked) => {
                      updateOptions({
                        interaction: {
                          autoResetSheetStyle: checked,
                        },
                      });
                    }}
                  />
                </Tooltip>
              </Space>
            </Collapse.Panel>
            <Collapse.Panel header="宽高调整热区配置" key="resize">
              <ResizeConfig setOptions={setOptions} setThemeCfg={setThemeCfg} />
            </Collapse.Panel>
          </Collapse>
          {render && (
            <SheetComponent
              key="basic"
              dataCfg={dataCfg as S2DataConfig}
              options={mergedOptions as S2Options}
              sheetType={sheetType}
              adaptive={adaptive}
              ref={s2Ref}
              themeCfg={themeCfg}
              partDrillDown={partDrillDown}
              header={{
                title: (
                  <a href="https://github.com/antvis/S2">
                    {reactPkg.name} playground
                  </a>
                ),
                description: (
                  <Space>
                    <span>
                      {reactPkg.name}: <Tag>{reactPkg.version}</Tag>
                    </span>
                    <span>
                      {corePkg.name}: <Tag>{corePkg.version}</Tag>
                    </span>
                  </Space>
                ),
                switcherCfg: { open: true },
                exportCfg: { open: true },
                advancedSortCfg: { open: true },
              }}
              onDataCellTrendIconClick={logHandler('onDataCellTrendIconClick')}
              onLoad={logHandler('onLoad')}
              onDestroy={logHandler('onDestroy')}
              onColCellClick={onColCellClick}
              onRowCellClick={logHandler('onRowCellClick')}
              onCornerCellClick={logHandler('onCornerCellClick')}
              onDataCellClick={logHandler('onDataCellClick')}
            />
          )}
        </TabPane>
        <TabPane tab="自定义目录树" key="customTree">
          <SheetComponent
            dataCfg={{ data: dataCustomTrees, fields: customTreeFields }}
            options={{ width: 600, height: 480, hierarchyType: 'customTree' }}
          />
        </TabPane>
        <TabPane tab="趋势分析表" key="strategy">
          <Space size="middle" style={{ marginBottom: 20, display: 'flex' }}>
            <Radio.Group
              onChange={onStrategyDataTypeChange}
              defaultValue="customTree"
            >
              <Radio.Button value="singleMeasure">单指标</Radio.Button>
              <Radio.Button value="multiMeasure">多指标</Radio.Button>
              <Radio.Button value="customTree">自定义目录树</Radio.Button>
            </Radio.Group>
          </Space>
          <SheetComponent
            sheetType="strategy"
            dataCfg={strategyDataCfg}
            options={strategyOptions}
            onRowCellClick={(v) => console.log(v)}
            header={{ exportCfg: { open: true } }}
            themeCfg={{
              theme: defaultTheme as unknown as S2Theme,
              name: 'gray',
            }}
          />
        </TabPane>
        <TabPane tab="网格分析表" key="gridAnalysis">
          <SheetComponent
            sheetType="gridAnalysis"
            dataCfg={mockGridAnalysisDataCfg}
            options={mockGridAnalysisOptions}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

ReactDOM.render(<MainLayout />, document.getElementById('root'));
