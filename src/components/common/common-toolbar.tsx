"use client";

import { useAppContext } from "@/contexts/app-context";
import {
    FaFileExport,
    FaPlus,
    FaPrint,
    FaSave,
    FaSearch,
    FaTrash,
    FaUndo
} from "react-icons/fa";

interface CommonToolbarProps {
    onReset?: () => void;
    onSearch?: () => void;
    onAddRow?: () => void;
    onDeleteRow?: () => void;
    onSave?: () => void;
    onPrint?: () => void;
    onExport?: () => void;

    visibleReset?: boolean;
    visibleSearch?: boolean;
    visibleAddRow?: boolean;
    visibleDeleteRow?: boolean;
    visibleSave?: boolean;
    visiblePrint?: boolean;
    visibleExprot?: boolean;
}

export function CommonToolbar({
    onReset,
    onSearch,
    onAddRow,
    onDeleteRow,
    onSave,
    onPrint,
    onExport,
    visibleReset,
    visibleSearch,
    visibleAddRow,
    visibleDeleteRow,
    visibleSave,
    visiblePrint,
    visibleExprot
}: CommonToolbarProps) {
    //const { currentUser } = useAppContext();

    return (
        <div className="">
            <div className="flex items-center justify-between space-x-2">
                <div className="px-3">
                    <div className="flex flex-wrap gap-2 justify-start items-center">
                        {visibleReset && (
                            <button onClick={onReset} className="toolbar-btn bg-gray-200 hover:bg-gray-300 text-gray-800">
                                <FaUndo className="mr-2" /> 초기화
                            </button>
                        )}
                        {visibleSearch && (
                            <button onClick={onSearch} className="toolbar-btn bg-blue-100 hover:bg-blue-200 text-blue-800">
                                <FaSearch className="mr-2" /> 조회
                            </button>
                        )}
                        {visibleAddRow && (
                            <button onClick={onAddRow} className="toolbar-btn bg-green-100 hover:bg-green-200 text-green-800">
                                <FaPlus className="mr-2" /> 행추가
                            </button>
                        )}
                        {visibleDeleteRow && (
                            <button onClick={onDeleteRow} className="toolbar-btn bg-red-100 hover:bg-red-200 text-red-800">
                                <FaTrash className="mr-2" /> 행삭제
                            </button>
                        )}
                        {visibleSave && (
                            <button onClick={onSave} className="toolbar-btn bg-yellow-100 hover:bg-yellow-200 text-yellow-800">
                                <FaSave className="mr-2" /> 저장
                            </button>
                        )}
                        {visiblePrint && (
                            <button onClick={onPrint} className="toolbar-btn bg-purple-100 hover:bg-purple-200 text-purple-800">
                                <FaPrint className="mr-2" /> 출력
                            </button>
                        )}
                        {visibleExprot && (
                            <button onClick={onExport} className="toolbar-btn bg-emerald-100 hover:bg-emerald-200 text-emerald-800">
                                <FaFileExport className="mr-2" /> 엑셀
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}