"use client"

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {AlertCircle, DollarSign, Package, ShoppingCart, TrendingUp, Users} from 'lucide-react';

export const DashBoardMain = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('이번달');
    const [isChartReady, setIsChartReady] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [containerDimensions, setContainerDimensions] = useState({width: 0, height: 0});
    const barChartRef = useRef<HTMLDivElement>(null);
    const pieChartRef = useRef<HTMLDivElement>(null);

    // 컨테이너 크기 감지 및 차트 준비
    useEffect(() => {
        const updateDimensions = () => {
            if (barChartRef.current) {
                const rect = barChartRef.current.getBoundingClientRect();
                setContainerDimensions({
                    width: rect.width,
                    height: rect.height
                });
            }
        };

        // 초기 크기 설정
        updateDimensions();

        // 리사이즈 이벤트 리스너
        const resizeObserver = new ResizeObserver(() => {
            updateDimensions();
        });

        if (barChartRef.current) {
            resizeObserver.observe(barChartRef.current);
        }

        // 차트 렌더링 준비 - 컨테이너 크기가 설정된 후에 활성화
        const timer = setTimeout(() => {
            updateDimensions();
            setIsChartReady(true);
        }, 200);

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
        };
    }, []);

    // 페이지 visibility 변경 감지
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsVisible(false);
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setIsVisible(true);
                    // visibility가 변경될 때도 차트 크기를 다시 확인
                    if (barChartRef.current) {
                        const rect = barChartRef.current.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            setIsChartReady(true);
                        }
                    }
                }, 300);
            }
        };

        const handleFocus = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsVisible(true);
                setIsChartReady(true);
            }, 200);
        };

        const handleBlur = () => {
            setIsVisible(false);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // 정적 데이터를 useMemo로 메모이제이션하여 리렌더링 방지
    const salesData = useMemo(() => [
        {month: '1월', amount: 45000},
        {month: '2월', amount: 52000},
        {month: '3월', amount: 48000},
        {month: '4월', amount: 61000},
        {month: '5월', amount: 55000},
        {month: '6월', amount: 67000},
        {month: '7월', amount: 67000},
        {month: '8월', amount: 0},
        {month: '9월', amount: 0},
        {month: '10월', amount: 0},
        {month: '11월', amount: 0},
        {month: '12월', amount: 0}
    ], []);

    const orderStatusData = useMemo(() => [
        {name: '완료', value: 45, color: '#10B981'},
        {name: '진행중', value: 18, color: '#F59E0B'},
        {name: '대기', value: 12, color: '#6B7280'},
        {name: '지연', value: 3, color: '#EF4444'}
    ], []);

    const inventoryAlerts = useMemo(() => [
        {item: 'A-001 품목1', orderQty: 100, workQty: 80},
        {item: 'A-002 품목2', orderQty: 120, workQty: 120},
        {item: 'A-003 품목3', orderQty: 200, workQty: 100},
        {item: 'A-004 품목4', orderQty: 3000, workQty: 1500},
        {item: 'A-005 품목5', orderQty: 250, workQty: 200},
        {item: 'A-006 품목6', orderQty: 80, workQty: 80}
    ], []);

    const productionData = useMemo(() => [
        {item: 'A-001 품목1', lot: '12 LOT', workQty: 150, defectQty: 3},
        {item: 'A-002 품목2', lot: '10 LOT', workQty: 500, defectQty: 8},
        {item: 'A-003 품목3', lot: '8 LOT', workQty: 200, defectQty: 1},
        {item: 'A-004 품목4', lot: '20 LOT', workQty: 300, defectQty: 5},
        {item: 'A-005 품목5', lot: '15 LOT', workQty: 400, defectQty: 7},
        {item: 'A-006 품목6', lot: '6 LOT', workQty: 180, defectQty: 2}
    ], []);

    // 차트 렌더링 조건 확인
    const shouldRenderCharts = isChartReady && isVisible && containerDimensions.width > 0;

    return (
        <div className="p-4 space-y-2 min-h-screen">
            {/* 헤더 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div
                    className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        <h3 className="text-base font-semibold text-gray-800">대시보드
                            <span className={"text-red-600 text-sm items-center text-center"}>  (Mock 데이터 입니다.)</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-1 rounded-lg border border-gray-200">
                        <label
                            className="text-sm font-semibold text-gray-700 min-w-[50px] whitespace-nowrap text-center">
                            조회기간
                        </label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-[150px] px-3 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                            <option value="오늘">오늘</option>
                            <option value="이번주">이번주</option>
                            <option value="이번달">이번달</option>
                            <option value="이번분기">이번분기</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* 매출액 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">매출액</p>
                            <div className="flex items-baseline space-x-2">
                                <h3 className="text-2xl font-bold text-gray-900">67,000</h3>
                                <span className="text-sm text-gray-500">만원</span>
                            </div>
                            <div className="flex items-center mt-2 text-sm text-green-600">
                                <TrendingUp className="w-4 h-4 mr-1"/>
                                <span>22% 증가</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-blue-600"/>
                        </div>
                    </div>
                </div>

                {/* 수주건수 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">수주건수</p>
                            <div className="flex items-baseline space-x-2">
                                <h3 className="text-2xl font-bold text-gray-900">78</h3>
                                <span className="text-sm text-gray-500">건</span>
                            </div>
                            <div className="flex items-center mt-2 text-sm text-green-600">
                                <TrendingUp className="w-4 h-4 mr-1"/>
                                <span>15% 증가</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-green-600"/>
                        </div>
                    </div>
                </div>

                {/* 신규품목수 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">신규품목수</p>
                            <div className="flex items-baseline space-x-2">
                                <h3 className="text-2xl font-bold text-gray-900">10</h3>
                                <span className="text-sm text-gray-500">개</span>
                            </div>
                            <div className="flex items-center mt-2 text-sm text-green-600">
                                <TrendingUp className="w-4 h-4 mr-1"/>
                                <span>12% 증가</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-purple-600"/>
                        </div>
                    </div>
                </div>

                {/* 총 생산LOT수 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">총 생산LOT수</p>
                            <div className="flex items-baseline space-x-2">
                                <h3 className="text-2xl font-bold text-gray-900">50</h3>
                                <span className="text-sm text-gray-500">LOT</span>
                            </div>
                            <div className="flex items-center mt-2 text-sm text-green-600">
                                <TrendingUp className="w-4 h-4 mr-1"/>
                                <span>8% 증가</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-yellow-600"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-[400px]">
                {/* 월별 매출 현황 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            <h3 className="text-base font-semibold text-gray-800">월별 매출 현황</h3>
                        </div>
                    </div>
                    <div className="p-2">
                        <div
                            ref={barChartRef}
                            className="w-full h-[350px] min-w-0 min-h-0"
                            style={{minWidth: '300px', minHeight: '300px'}}
                        >
                            {shouldRenderCharts ? (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                    debounce={200}
                                    minWidth={300}
                                    minHeight={300}
                                >
                                    <BarChart data={salesData} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                        <XAxis
                                            dataKey="month"
                                            tick={{fontSize: 12, fill: '#374151'}}
                                            tickLine={{stroke: '#9CA3AF'}}
                                            axisLine={{stroke: '#9CA3AF'}}
                                            interval={0}
                                            scale="band"
                                            angle={-45}
                                            textAnchor="end"
                                            minTickGap={10}
                                        />
                                        <YAxis
                                            tick={{fontSize: 12, fill: '#374151'}}
                                            tickLine={{stroke: '#9CA3AF'}}
                                            axisLine={{stroke: '#9CA3AF'}}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value.toLocaleString()}만원`, '매출액']}
                                            contentStyle={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '6px'
                                            }}
                                        />
                                        <Bar dataKey="amount" fill="#3B82F6"/>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-gray-50">
                                    <div className="text-gray-400">차트를 로딩중...</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 수주 현황 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            <h3 className="text-base font-semibold text-gray-800">수주 현황</h3>
                        </div>
                    </div>
                    <div className="p-2">
                        <div
                            ref={pieChartRef}
                            className="w-full h-[300px] min-w-0 min-h-0"
                            style={{minWidth: '250px', minHeight: '250px'}}
                        >
                            {shouldRenderCharts ? (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                    debounce={200}
                                    minWidth={250}
                                    minHeight={250}
                                >
                                    <PieChart>
                                        <Pie
                                            data={orderStatusData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={800}
                                        >
                                            {orderStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color}/>
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value}건`, '']}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-gray-50">
                                    <div className="text-gray-400">차트를 로딩중...</div>
                                </div>
                            )}
                        </div>
                        {/* 범례 */}
                        <div className="flex justify-center space-x-4 mt-2">
                            {orderStatusData.map((item, index) => (
                                <div key={index} className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded mr-2"
                                        style={{backgroundColor: item.color}}
                                    ></div>
                                    <span className="text-xs text-gray-600">{item.name}: {item.value}건</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단 정보 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* 품목별 수주현황 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            <h3 className="text-base font-semibold text-gray-800">품목별 수주 현황</h3>
                        </div>
                    </div>
                    <div className="p-3" style={{height: '250px', overflowY: 'auto'}}>
                        <div className="space-y-2">
                            {inventoryAlerts.map((alert, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-2 text-gray-400"/>
                                            <span className="text-md font-bold text-gray-800">{alert.item}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 text-sm text-gray-600">
                                            <div className="text-center">
                                                <span className="font-medium">수주수량</span>
                                                <div
                                                    className="text-blue-600 font-bold">{alert.orderQty.toLocaleString()}</div>
                                            </div>
                                            <div className="text-center">
                                                <span className="font-medium">완료수량</span>
                                                <div
                                                    className="text-green-600 font-bold">{alert.workQty.toLocaleString()}</div>
                                            </div>
                                            <div className="text-center">
                                                <span className="font-medium">미완료수량</span>
                                                <div
                                                    className="text-red-600 font-bold">{(alert.orderQty - alert.workQty).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 생산 현황 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            <h3 className="text-base font-semibold text-gray-800">생산 현황</h3>
                        </div>
                    </div>
                    <div className="p-3" style={{height: '250px', overflowY: 'auto'}}>
                        <div className="space-y-2">
                            {productionData.map((item, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-md font-bold text-gray-800">{item.item}</span>
                                        <span className="text-md text-gray-700 bg-gray-200 px-2 py-1 rounded">
                                            총 생산 LOT수: {item.lot}
                                        </span>

                                        <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">총 작업수량</span>
                                                <div className="text-blue-600 font-bold">{item.workQty.toLocaleString()}개
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-medium">총 불량</span>
                                                <div
                                                    className="text-red-600 font-bold">{item.defectQty.toLocaleString()}개
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};