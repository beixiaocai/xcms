// 业务算法弹窗管理脚本
(function() {
    'use strict';
    
    // 全局变量
    let currentFlowMode = 'add'; // 'add' 或 'edit'
    let currentFlowCode = '';
    
    // 数据字典
    let modeDict = {};
    let algorithmDetectDict = {};
    let algorithmDetect2Dict = {};
    let algorithmClassifyDict = {};
    let algorithmTrackDict = {};
    let behaviourDict = {};
    
    // DOM元素
    const elements = {
        modal: null,
        modalTitle: null,
        flowCode: null,
        flowName: null,
        flowMode: null,
        flowDiagram: null,
        flowModeName: null,
        flowConfig: null,
        deployProcessIndex: null,
        maxConcurrency: null,
        concurrencyUnitLength: null,
        flowRemark: null,
        submitBtn: null,
        submitBtnText: null
    };
    
    // 初始化DOM元素
    function initElements() {
        elements.modal = $('#flowModal');
        elements.modalTitle = $('#flowModalTitle');
        elements.flowCode = $('#flow_code');
        elements.flowName = $('#flow_name');
        elements.flowMode = $('#flow_mode');
        elements.flowDiagram = $('#flow_diagram');
        elements.flowModeName = $('#flow_mode_name');
        elements.flowConfig = $('#flow_config');
        elements.deployProcessIndex = $('#deploy_process_index');
        elements.maxConcurrency = $('#max_concurrency');
        elements.concurrencyUnitLength = $('#concurrency_unit_length');
        elements.flowRemark = $('#flow_remark');
        elements.submitBtn = $('#flowSubmitBtn');
        elements.submitBtnText = $('#submitBtnText');
    }
    
    // 打开添加弹窗
    window.openAddFlowModal = function() {
        currentFlowMode = 'add';
        currentFlowCode = '';
        
        elements.modalTitle.text('添加业务算法');
        elements.modal.addClass('active');
        
        // 加载添加所需数据
        $.ajax({
            url: '/algorithmFlow/openAddContext',
            type: 'post',
            dataType: 'json',
            success: function(res) {
                if (res.code === 1000) {
                    loadFormData(res.data, 'add');
                } else {
                    myToast2025(res.msg, 'error');
                }
            },
            error: function() {
                myToast2025('网络异常，请确定网络正常！', 'error');
            }
        });
    };
    
    // 打开编辑弹窗
    window.openEditFlowModal = function(code) {
        currentFlowMode = 'edit';
        currentFlowCode = code;
        
        elements.modalTitle.text('编辑业务算法');
        elements.modal.addClass('active');
        
        // 加载编辑所需数据
        $.ajax({
            url: '/algorithmFlow/openEditContext',
            type: 'post',
            data: { code: code },
            dataType: 'json',
            success: function(res) {
                if (res.code === 1000) {
                    loadFormData(res.data, 'edit');
                } else {
                    myToast2025(res.msg, 'error');
                }
            },
            error: function() {
                myToast2025('网络异常，请确定网络正常！', 'error');
            }
        });
    };
    
    // 关闭弹窗
    window.closeFlowModal = function() {
        elements.modal.removeClass('active');
        setTimeout(function() {
            resetForm();
        }, 300);
    };
    
    // 加载表单数据
    function loadFormData(data, mode) {
        // 构建模式字典
        modeDict = {};
        if (data.modes) {
            data.modes.forEach(function(m) {
                modeDict[m.id] = m;
            });
            
            // 填充模式下拉框
            let modeHtml = '<option value="0">请选择算法模式</option>';
            data.modes.forEach(function(m) {
                if (m.state === 1) {
                    modeHtml += '<option value="' + m.id + '">' + m.name + '</option>';
                }
            });
            elements.flowMode.html(modeHtml);
        }
        
        // 构建算法字典并填充下拉框
        algorithmDetectDict = buildAlgorithmDict(data.algorithm_detect_data);
        algorithmDetect2Dict = buildAlgorithmDict(data.algorithm_detect_data);
        algorithmClassifyDict = buildAlgorithmDict(data.algorithm_classify_data);
        algorithmTrackDict = buildAlgorithmDict(data.algorithm_track_data);
        
        fillAlgorithmSelect('#select_algorithm_detect', data.algorithm_detect_data);
        fillAlgorithmSelect('#select_algorithm_detect2', data.algorithm_detect_data);
        fillAlgorithmSelect('#select_algorithm_classify', data.algorithm_classify_data);
        fillAlgorithmSelect('#select_algorithm_track', data.algorithm_track_data);
        
        // 构建行为算法字典并填充下拉框
        behaviourDict = {};
        if (data.behaviours) {
            let behaviourHtml = '<option value="0">选择行为算法</option>';
            data.behaviours.forEach(function(b) {
                behaviourDict[b.code] = b;
                behaviourHtml += '<option value="' + b.code + '">' + b.name + ' (' + b.way_code + ')</option>';
            });
            $('#select_behaviour').html(behaviourHtml);
        }
        
        // 填充表单
        if (mode === 'add') {
            elements.flowCode.val(data.flow_code);
            elements.flowName.val('');
            elements.flowMode.val('0');
            elements.deployProcessIndex.val(data.deploy_process_index || 0);
            elements.maxConcurrency.val(data.max_concurrency || 1);
            elements.concurrencyUnitLength.val(data.concurrency_unit_length || 1);
            elements.flowRemark.val('');
            
            elements.flowDiagram.hide();
            elements.flowConfig.hide();
        } else {
            const flow = data.flow;
            elements.flowCode.val(flow.code);
            elements.flowName.val(flow.name);
            elements.flowMode.val(flow.mode);
            elements.deployProcessIndex.val(flow.deploy_process_index);
            elements.maxConcurrency.val(flow.max_concurrency);
            elements.concurrencyUnitLength.val(flow.concurrency_unit_length);
            elements.flowRemark.val(flow.remark || '');
            
            // 显示流程图
            showFlow(flow.mode);
            
            // 设置算法选择
            $('#select_algorithm_detect').val(flow.algorithm_detect_code || '0');
            $('#select_algorithm_detect2').val(flow.algorithm_detect2_code || '0');
            $('#select_algorithm_classify').val(flow.algorithm_classify_code || '0');
            $('#select_algorithm_track').val(flow.algorithm_track_code || '0');
            $('#select_behaviour').val(flow.behaviour_code || '0');
            
            // 显示目标选项
            if (flow.algorithm_detect_code && flow.algorithm_detect_code !== '0') {
                showDetectOptions(flow.algorithm_detect_code, flow.detect_class_names || '');
            }
            if (flow.algorithm_detect2_code && flow.algorithm_detect2_code !== '0') {
                showDetect2Options(flow.algorithm_detect2_code, flow.detect2_class_names || '');
            }
            if (flow.algorithm_classify_code && flow.algorithm_classify_code !== '0') {
                showClassifyOptions(flow.algorithm_classify_code, flow.classify_class_names || '');
            }
            
            elements.flowConfig.show();
        }
    }
    
    // 构建算法字典
    function buildAlgorithmDict(algorithmArray) {
        const dict = {};
        if (algorithmArray) {
            algorithmArray.forEach(function(alg) {
                dict[alg.code] = alg;
            });
        }
        return dict;
    }
    
    // 填充算法下拉框
    function fillAlgorithmSelect(selector, algorithmArray) {
        let html = '<option value="0">选择算法</option>';
        if (algorithmArray) {
            algorithmArray.forEach(function(alg) {
                html += '<option value="' + alg.code + '">' + alg.name + 
                        ' (' + alg.framework + '/' + alg.inference + '/' + alg.inference_device + ')</option>';
            });
        }
        $(selector).html(html);
    }
    
    // 显示流程图
    function showFlow(mode) {
        // 隐藏所有节点和箭头
        $('#flow_box_detect, #flow_box_detect_class, #flow_box_detect2, #flow_box_detect2_class, ' +
          '#flow_box_classify, #flow_box_classify_class, #flow_box_track, #flow_box_behaviour, ' +
          '#arrow_after_detect, #arrow_after_detect2, #arrow_after_classify, #arrow_after_track').hide();
        
        if (mode === 0 || mode === '0') {
            elements.flowDiagram.hide();
            elements.flowConfig.hide();
            return;
        }
        
        mode = parseInt(mode);
        elements.flowDiagram.show();
        elements.flowConfig.show();
        
        const modeName = modeDict[mode] ? modeDict[mode].name : '未知模式';
        elements.flowModeName.html('<i class="fa fa-info-circle"></i> 当前选择：' + modeName);
        
        switch (mode) {
            case 1: // 检测算法>>行为算法
                $('#flow_box_detect, #arrow_after_detect, #flow_box_behaviour').show();
                break;
            case 2: // 检测算法>>特征算法>>行为算法
                $('#flow_box_detect, #arrow_after_detect, #flow_box_track, #arrow_after_track, #flow_box_behaviour').show();
                break;
            case 3: // 检测算法>>分类算法>>行为算法
                $('#flow_box_detect, #arrow_after_detect, #flow_box_classify, #arrow_after_classify, #flow_box_behaviour').show();
                break;
            case 4: // 分类算法>>行为算法
                $('#flow_box_classify, #arrow_after_classify, #flow_box_behaviour').show();
                break;
            case 5: // 行为算法
                $('#flow_box_behaviour').show();
                break;
            case 6: // 分类算法>>检测算法>>行为算法
                $('#flow_box_classify, #arrow_after_classify, #flow_box_detect, #arrow_after_detect, #flow_box_behaviour').show();
                break;
            case 7: // 检测算法>>分类算法>>特征算法>>行为算法
                $('#flow_box_detect, #arrow_after_detect, #flow_box_classify, #arrow_after_classify, ' +
                  '#flow_box_track, #arrow_after_track, #flow_box_behaviour').show();
                break;
            case 8: // 检测算法>>检测算法>>行为算法
                $('#flow_box_detect, #arrow_after_detect, #flow_box_detect2, #arrow_after_detect2, #flow_box_behaviour').show();
                break;
        }
    }
    
    // 显示检测目标选项
    function showDetectOptions(algorithmCode, selectedClassNames) {
        const algorithm = algorithmDetectDict[algorithmCode];
        if (!algorithm) {
            $('#flow_box_detect_class').hide();
            return;
        }
        
        const modelClassNames = algorithm.model_class_names.split(',');
        const selectedArray = selectedClassNames.split(',');
        
        let html = '';
        modelClassNames.forEach(function(className) {
            const selected = selectedArray.indexOf(className) > -1 ? 'selected' : '';
            html += '<option ' + selected + ' value="' + className + '">' + className + '</option>';
        });
        
        $('#select_detect_class_name').html(html);
        $('#flow_box_detect_class').show();
    }
    
    // 显示二次检测目标选项
    function showDetect2Options(algorithmCode, selectedClassNames) {
        const algorithm = algorithmDetect2Dict[algorithmCode];
        if (!algorithm) {
            $('#flow_box_detect2_class').hide();
            return;
        }
        
        const modelClassNames = algorithm.model_class_names.split(',');
        const selectedArray = selectedClassNames.split(',');
        
        let html = '';
        modelClassNames.forEach(function(className) {
            const selected = selectedArray.indexOf(className) > -1 ? 'selected' : '';
            html += '<option ' + selected + ' value="' + className + '">' + className + '</option>';
        });
        
        $('#select_detect2_class_name').html(html);
        $('#flow_box_detect2_class').show();
    }
    
    // 显示分类目标选项
    function showClassifyOptions(algorithmCode, selectedClassNames) {
        const algorithm = algorithmClassifyDict[algorithmCode];
        if (!algorithm) {
            $('#flow_box_classify_class').hide();
            return;
        }
        
        const modelClassNames = algorithm.model_class_names.split(',');
        const selectedArray = selectedClassNames.split(',');
        
        let html = '';
        modelClassNames.forEach(function(className) {
            const selected = selectedArray.indexOf(className) > -1 ? 'selected' : '';
            html += '<option ' + selected + ' value="' + className + '">' + className + '</option>';
        });
        
        $('#select_classify_class_name').html(html);
        $('#flow_box_classify_class').show();
    }
    
    // 提交表单
    window.submitFlowForm = function() {
        const mode = parseInt(elements.flowMode.val());
        const name = elements.flowName.val().trim();
        
        if (!name) {
            myToast2025('请输入算法名称', 'error');
            return;
        }
        
        if (mode === 0) {
            myToast2025('请选择算法模式', 'error');
            return;
        }
        
        // 根据模式验证必填项
        let algorithmDetectCode = '0';
        let detectClassNames = '';
        let algorithmDetect2Code = '0';
        let detect2ClassNames = '';
        let algorithmClassifyCode = '0';
        let classifyClassNames = '';
        let algorithmTrackCode = '0';
        let behaviourCode = '0';
        
        switch (mode) {
            case 1: // 检测>>行为
                algorithmDetectCode = $('#select_algorithm_detect').val();
                if (algorithmDetectCode === '0') {
                    myToast2025('请选择检测算法', 'error');
                    return;
                }
                detectClassNames = calcOptionStr($('#select_detect_class_name').val());
                if (!detectClassNames) {
                    myToast2025('请至少选择1个检测目标', 'error');
                    return;
                }
                behaviourCode = $('#select_behaviour').val();
                if (behaviourCode === '0') {
                    myToast2025('请选择行为算法', 'error');
                    return;
                }
                break;
            case 2: // 检测>>特征>>行为
                algorithmDetectCode = $('#select_algorithm_detect').val();
                if (algorithmDetectCode === '0') {
                    myToast2025('请选择检测算法', 'error');
                    return;
                }
                detectClassNames = calcOptionStr($('#select_detect_class_name').val());
                if (!detectClassNames) {
                    myToast2025('请至少选择1个检测目标', 'error');
                    return;
                }
                algorithmTrackCode = $('#select_algorithm_track').val();
                if (algorithmTrackCode === '0') {
                    myToast2025('请选择特征算法', 'error');
                    return;
                }
                behaviourCode = $('#select_behaviour').val();
                if (behaviourCode === '0') {
                    myToast2025('请选择行为算法', 'error');
                    return;
                }
                break;
            case 3: // 检测>>分类>>行为
                algorithmDetectCode = $('#select_algorithm_detect').val();
                if (algorithmDetectCode === '0') {
                    myToast2025('请选择检测算法', 'error');
                    return;
                }
                detectClassNames = calcOptionStr($('#select_detect_class_name').val());
                if (!detectClassNames) {
                    myToast2025('请至少选择1个检测目标', 'error');
                    return;
                }
                algorithmClassifyCode = $('#select_algorithm_classify').val();
                if (algorithmClassifyCode === '0') {
                    myToast2025('请选择分类算法', 'error');
                    return;
                }
                classifyClassNames = calcOptionStr($('#select_classify_class_name').val());
                if (!classifyClassNames) {
                    myToast2025('请至少选择1个分类目标', 'error');
                    return;
                }
                behaviourCode = $('#select_behaviour').val();
                if (behaviourCode === '0') {
                    myToast2025('请选择行为算法', 'error');
                    return;
                }
                break;
            case 4: // 分类>>行为
                algorithmClassifyCode = $('#select_algorithm_classify').val();
                if (algorithmClassifyCode === '0') {
                    myToast2025('请选择分类算法', 'error');
                    return;
                }
                classifyClassNames = calcOptionStr($('#select_classify_class_name').val());
                if (!classifyClassNames) {
                    myToast2025('请至少选择1个分类目标', 'error');
                    return;
                }
                behaviourCode = $('#select_behaviour').val();
                if (behaviourCode === '0') {
                    myToast2025('请选择行为算法', 'error');
                    return;
                }
                break;
            case 5: // 行为
                behaviourCode = $('#select_behaviour').val();
                if (behaviourCode === '0') {
                    myToast2025('请选择行为算法', 'error');
                    return;
                }
                break;
            case 6: // 分类>>检测>>行为
                algorithmClassifyCode = $('#select_algorithm_classify').val();
                if (algorithmClassifyCode === '0') {
                    myToast2025('请选择分类算法', 'error');
                    return;
                }
                classifyClassNames = calcOptionStr($('#select_classify_class_name').val());
                if (!classifyClassNames) {
                    myToast2025('请至少选择1个分类目标', 'error');
                    return;
                }
                algorithmDetectCode = $('#select_algorithm_detect').val();
                if (algorithmDetectCode === '0') {
                    myToast2025('请选择检测算法', 'error');
                    return;
                }
                detectClassNames = calcOptionStr($('#select_detect_class_name').val());
                if (!detectClassNames) {
                    myToast2025('请至少选择1个检测目标', 'error');
                    return;
                }
                behaviourCode = $('#select_behaviour').val();
                if (behaviourCode === '0') {
                    myToast2025('请选择行为算法', 'error');
                    return;
                }
                break;
            case 7: // 检测>>分类>>特征>>行为
                algorithmDetectCode = $('#select_algorithm_detect').val();
                if (algorithmDetectCode === '0') {
                    myToast2025('请选择检测算法', 'error');
                    return;
                }
                detectClassNames = calcOptionStr($('#select_detect_class_name').val());
                if (!detectClassNames) {
                    myToast2025('请至少选择1个检测目标', 'error');
                    return;
                }
                algorithmClassifyCode = $('#select_algorithm_classify').val();
                if (algorithmClassifyCode === '0') {
                    myToast2025('请选择分类算法', 'error');
                    return;
                }
                classifyClassNames = calcOptionStr($('#select_classify_class_name').val());
                if (!classifyClassNames) {
                    myToast2025('请至少选择1个分类目标', 'error');
                    return;
                }
                algorithmTrackCode = $('#select_algorithm_track').val();
                if (algorithmTrackCode === '0') {
                    myToast2025('请选择特征算法', 'error');
                    return;
                }
                behaviourCode = $('#select_behaviour').val();
                if (behaviourCode === '0') {
                    myToast2025('请选择行为算法', 'error');
                    return;
                }
                break;
            case 8: // 检测>>检测>>行为
                algorithmDetectCode = $('#select_algorithm_detect').val();
                if (algorithmDetectCode === '0') {
                    myToast2025('请选择检测算法', 'error');
                    return;
                }
                detectClassNames = calcOptionStr($('#select_detect_class_name').val());
                if (!detectClassNames) {
                    myToast2025('请至少选择1个检测目标', 'error');
                    return;
                }
                algorithmDetect2Code = $('#select_algorithm_detect2').val();
                if (algorithmDetect2Code === '0') {
                    myToast2025('请选择第二个检测算法', 'error');
                    return;
                }
                detect2ClassNames = calcOptionStr($('#select_detect2_class_name').val());
                if (!detect2ClassNames) {
                    myToast2025('请至少选择1个二次检测目标', 'error');
                    return;
                }
                behaviourCode = $('#select_behaviour').val();
                if (behaviourCode === '0') {
                    myToast2025('请选择行为算法', 'error');
                    return;
                }
                break;
        }
        
        const data = {
            handle: currentFlowMode,
            flow_code: elements.flowCode.val(),
            name: name,
            mode: mode,
            algorithm_detect_code: algorithmDetectCode,
            detect_class_names: detectClassNames,
            algorithm_detect2_code: algorithmDetect2Code,
            detect2_class_names: detect2ClassNames,
            algorithm_classify_code: algorithmClassifyCode,
            classify_class_names: classifyClassNames,
            algorithm_track_code: algorithmTrackCode,
            behaviour_code: behaviourCode,
            deploy_process_index: elements.deployProcessIndex.val(),
            max_concurrency: elements.maxConcurrency.val(),
            concurrency_unit_length: elements.concurrencyUnitLength.val(),
            remark: elements.flowRemark.val()
        };
        
        const url = currentFlowMode === 'add' ? '/algorithmFlow/openAdd' : '/algorithmFlow/openEdit';
        
        // 禁用提交按钮
        elements.submitBtn.prop('disabled', true);
        elements.submitBtnText.html('<span class="xc_loading-icon"></span> 提交中...');
        
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            dataType: 'json',
            success: function(res) {
                elements.submitBtn.prop('disabled', false);
                elements.submitBtnText.text('提交');
                
                if (res.code === 1000) {
                    myToast2025(res.msg, 'success', 1000);
                    setTimeout(function() {
                        closeFlowModal();
                        window.location.reload();
                    }, 1000);
                } else {
                    myToast2025(res.msg, 'error');
                }
            },
            error: function() {
                elements.submitBtn.prop('disabled', false);
                elements.submitBtnText.text('提交');
                myToast2025('网络异常，请确定网络正常！', 'error');
            }
        });
    };
    
    // 计算选项字符串
    function calcOptionStr(optionArray) {
        if (!optionArray || optionArray.length === 0) {
            return '';
        }
        const filtered = optionArray.filter(function(item) {
            return item !== '0' && item !== '';
        });
        return filtered.join(',');
    }
    
    // 重置表单
    function resetForm() {
        elements.flowName.val('');
        elements.flowMode.val('0');
        elements.flowDiagram.hide();
        elements.flowConfig.hide();
        elements.flowRemark.val('');
        $('#select_algorithm_detect, #select_algorithm_detect2, #select_algorithm_classify, ' +
          '#select_algorithm_track, #select_behaviour').val('0');
        $('#flow_box_detect_class, #flow_box_detect2_class, #flow_box_classify_class').hide();
    }
    
    // 绑定事件
    function bindEvents() {
        // 模式改变事件
        elements.flowMode.on('change', function() {
            const mode = parseInt($(this).val());
            showFlow(mode);
        });
        
        // 检测算法改变
        $('#select_algorithm_detect').on('change', function() {
            const code = $(this).val();
            if (code !== '0') {
                showDetectOptions(code, '');
            } else {
                $('#flow_box_detect_class').hide();
            }
        });
        
        // 二次检测算法改变
        $('#select_algorithm_detect2').on('change', function() {
            const code = $(this).val();
            if (code !== '0') {
                showDetect2Options(code, '');
            } else {
                $('#flow_box_detect2_class').hide();
            }
        });
        
        // 分类算法改变
        $('#select_algorithm_classify').on('change', function() {
            const code = $(this).val();
            if (code !== '0') {
                showClassifyOptions(code, '');
            } else {
                $('#flow_box_classify_class').hide();
            }
        });
    }
    
    // 页面加载完成后初始化
    $(document).ready(function() {
        initElements();
        bindEvents();
    });
    
})();
