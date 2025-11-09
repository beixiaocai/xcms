// 基础算法弹窗管理脚本
(function() {
    'use strict';
    
    // 全局变量
    let currentModalMode = 'add'; // 'add' 或 'edit'
    let currentAlgorithmCode = '';
    let algorithmTypes = [];
    let isSubmitting = false;
    
    // 计时器相关
    let submitTimer = null;
    let submitTimerSeconds = 0;
    
    // 开始计时
    function startSubmitTimer() {
        submitTimerSeconds = 0;
        if(submitTimer) {
            clearInterval(submitTimer);
            submitTimer = null;
        }
        submitTimer = setInterval(function() {
            submitTimerSeconds++;
            $("#submit_timer").text("耗时" + submitTimerSeconds + "秒");
        }, 1000);
    }
    
    // 停止计时
    function stopSubmitTimer() {
        if(submitTimer) {
            clearInterval(submitTimer);
            submitTimer = null;
        }
    }
    
    // 复制模型目标
    window.copyModelClassNames = function() {
        let text = $("#input_model_class_names").val();
        if(!text) {
            myToast2025("模型目标为空，无法复制", "warning");
            return;
        }
        
        // 使用 Clipboard API
        if(navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() {
                myToast2025("复制成功！", "success");
            }).catch(function() {
                // 降级方案
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    };
    
    // 降级复制方案
    function fallbackCopy(text) {
        let textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            myToast2025("复制成功！", "success");
        } catch(err) {
            myToast2025("复制失败，请手动复制", "error");
        }
        document.body.removeChild(textarea);
    }
    
    // 加载添加基础算法的默认参数
    function f_loadAlgorithmAddContext(callback) {
        $.ajax({
            url: '/algorithm/openAddContext',
            type: "post",
            async: true,
            dataType: "json",
            error: function () {
                myToast2025("网络异常，请确定网络正常！", "error");
            },
            success: function (res) {
                if(1000 === res.code) {
                    algorithmTypes = res.data.algorithm_types || [];
                    if(callback) callback(res.data);
                } else {
                    myToast2025(res.msg, "error");
                }
            }
        });
    }
    
    // 打开添加弹窗
    window.openAddModal = function() {
        currentModalMode = 'add';
        currentAlgorithmCode = '';
        
        f_loadAlgorithmAddContext(function(data) {
            // 设置标题
            $("#modalTitle").html('<i class="fa fa-plus-circle"></i> 添加基础算法');
            $("#form_handle").val('add');
            $("#form_code").val(data.default_code || '');
            
            // 隐藏编号字段
            $("#code_group").hide();
            
            // 显示模型文件上传字段
            $("#model_file_group").show();
            $("#model_convert_group").show();
            $("#model_class_group").show();
            
            // 隐藏编辑模式下的只读字段
            $("#model_info_row").hide();
            
            // 启用所有字段
            $("#input_algorithm_type").prop('disabled', false);
            $("#input_framework").prop('disabled', false);
            $("#input_inference").prop('disabled', false);
            $("#input_model_convert_params").prop('disabled', false);
            $("#input_model_class_names").prop('disabled', false);
            
            // 清空表单
            $("#input_code_display").val('');
            $("#input_name").val('');
            $("#input_algorithm_type").val('0');
            $("#input_framework").html('<option value="0">请先选择算法类型</option>');
            $("#input_inference").html('<option value="0">请先选择算法类型</option>');
            $("#input_inference_device").val(data.default_inference_device || 'CPU');
            $("#input_extend_params").val(data.default_extend_params || '');
            $("#input_model_convert_params").val(data.default_model_convert_params || '--fp16');
            $("#input_model_class_names").val('');
            $("#input_model_file").val('');
            
            // 填充算法类型
            let html = '<option value="0">请选择</option>';
            for(let i = 0; i < algorithmTypes.length; i++) {
                html += '<option value="' + algorithmTypes[i].code + '">' + algorithmTypes[i].name + '</option>';
            }
            $("#input_algorithm_type").html(html);
            
            // 显示弹窗
            $("#algorithmModal").addClass('active');
        });
    };
    
    // 打开编辑弹窗
    window.openEditModal = function(code) {
        currentModalMode = 'edit';
        currentAlgorithmCode = code;
        
        // 设置标题
        $("#modalTitle").html('<i class="fa fa-edit"></i> 编辑基础算法');
        $("#form_handle").val('edit');
        $("#form_code").val(code);
        
        // 显示编号字段
        $("#code_group").show();
        
        // 隐藏模型文件上传相关字段
        $("#model_file_group").hide();
        
        // 编辑模式下，显示模型目标文本框（只读）
        $("#model_class_group").show();
        $("#model_info_row").show();
        
        // 禁用不可编辑的字段
        $("#input_algorithm_type").prop('disabled', true);
        $("#input_framework").prop('disabled', true);
        $("#input_inference").prop('disabled', true);
        $("#input_model_convert_params").prop('disabled', true);
        $("#input_model_class_names").prop('disabled', true); // 编辑模式下模型目标也是只读
        
        // 显示弹窗
        $("#algorithmModal").addClass('active');
        
        // 加载数据
        if (typeof ele_top_loading !== 'undefined') {
            ele_top_loading.show();
        }
        $.ajax({
            url: '/algorithm/openEditContext',
            type: "post",
            async: true,
            data: {"code": code},
            dataType: "json",
            error: function () {
                if (typeof ele_top_loading !== 'undefined') {
                    ele_top_loading.hide();
                }
                myToast2025("网络异常，请确定网络正常！", "error");
                closeAlgorithmModal();
            },
            success: function (res) {
                if (typeof ele_top_loading !== 'undefined') {
                    ele_top_loading.hide();
                }
                if(1000 === res.code) {
                    let d = res.data;
                    
                    // 填充表单
                    $("#input_code_display").val(d.code);
                    $("#input_name").val(d.name);
                    
                    // 显示算法类型（从 algorithmTypes 中查找名称）
                    let algorithmTypeName = d.algorithm_type;
                    for(let i = 0; i < algorithmTypes.length; i++) {
                        if(algorithmTypes[i].code === d.algorithm_type) {
                            algorithmTypeName = algorithmTypes[i].name;
                            break;
                        }
                    }
                    $("#input_algorithm_type").html('<option value="' + d.algorithm_type + '">' + algorithmTypeName + '</option>');
                    
                    $("#input_framework").html('<option>' + d.framework + '</option>');
                    $("#input_inference").html('<option>' + d.inference + '</option>');
                    $("#input_inference_device").val(d.inference_device);
                    $("#input_extend_params").val(d.extend_params);
                    $("#input_model_convert_params").val(d.model_convert_params || '');
                    $("#input_model_class_names").val(d.model_class_names || ''); // 显示模型目标
                    
                    // 显示只读信息
                    $("#input_model_class_len").val(d.model_class_names_len || '0');
                    $("#input_model_path").val(d.absolute_model_dir || '');
                    
                    // 显示模型文件状态
                    if(d.absolute_model_dir_exist) {
                        $("#model_status_display").html('<span style="color: #10b981; font-weight: 500;">✔ 正常</span>');
                    } else {
                        $("#model_status_display").html('<span style="color: #ef4444; font-weight: 500;">✖ 异常</span>');
                    }
                } else {
                    myToast2025(res.msg, "error");
                    closeAlgorithmModal();
                }
            }
        });
    };
    
    // 关闭弹窗
    window.closeAlgorithmModal = function() {
        $("#algorithmModal").removeClass('active');
        isSubmitting = false;
    };
    
    // 算法类型改变时加载框架和推理引擎
    $(document).on('change', '#input_algorithm_type', function() {
        let algorithm_type_code = $(this).val();
        if(algorithm_type_code && algorithm_type_code !== '0') {
            $.ajax({
                url: '/algorithm/openAlgorithmTypeAttrs',
                type: "get",
                async: true,
                data: {"algorithm_type_code": algorithm_type_code},
                dataType: "json",
                error: function () {
                    myToast2025("网络异常！", "error");
                },
                success: function (res) {
                    if(res.code === 1000) {
                        let info = res.info;
                        // 设置框架
                        let html = '<option value="0">请选择</option>';
                        let frameworks = info.frameworks || [];
                        for(let i = 0; i < frameworks.length; i++) {
                            html += '<option value="' + frameworks[i] + '">' + frameworks[i] + '</option>';
                        }
                        $("#input_framework").html(html);
                        
                        // 设置推理引擎
                        html = '<option value="0">请选择</option>';
                        let inferences = info.inferences || [];
                        for(let i = 0; i < inferences.length; i++) {
                            html += '<option value="' + inferences[i] + '">' + inferences[i] + '</option>';
                        }
                        $("#input_inference").html(html);
                    } else {
                        $("#input_framework").html('<option value="0">请选择</option>');
                        $("#input_inference").html('<option value="0">请选择</option>');
                    }
                }
            });
        } else {
            $("#input_framework").html('<option value="0">请先选择算法类型</option>');
            $("#input_inference").html('<option value="0">请先选择算法类型</option>');
        }
    });
    
    // 提交表单
    window.submitAlgorithmForm = function() {
        if(isSubmitting) {
            myToast2025("正在提交中，请勿重复操作！", "warning");
            return false;
        }
        
        let name = $("#input_name").val().trim();
        let algorithm_type = $("#input_algorithm_type").val();
        let framework = $("#input_framework").val();
        let inference = $("#input_inference").val();
        let inference_device = $("#input_inference_device").val().trim();
        let extend_params = $("#input_extend_params").val().trim();
        
        // 验证
        if(!name) {
            myToast2025("请输入算法名称", "error");
            $("#input_name").focus();
            return false;
        }
        
        if(!algorithm_type || algorithm_type === '0') {
            myToast2025("请选择算法类型", "error");
            $("#input_algorithm_type").focus();
            return false;
        }
        
        if(!framework || framework === '0') {
            myToast2025("请选择算法框架", "error");
            $("#input_framework").focus();
            return false;
        }
        
        if(!inference || inference === '0') {
            myToast2025("请选择推理引擎", "error");
            $("#input_inference").focus();
            return false;
        }
        
        if(!inference_device) {
            myToast2025("请输入推理设备", "error");
            $("#input_inference_device").focus();
            return false;
        }
        
        if(!extend_params) {
            myToast2025("请输入模型推理参数", "error");
            $("#input_extend_params").focus();
            return false;
        }
        
        if(currentModalMode === 'add') {
            // 添加模式下的额外验证
            let model_convert_params = $("#input_model_convert_params").val().trim();
            let model_class_names = $("#input_model_class_names").val().trim();
            let modelFile = $("#input_model_file")[0].files[0];
            
            if(!model_convert_params) {
                myToast2025("请输入模型转换参数", "error");
                $("#input_model_convert_params").focus();
                return false;
            }
            
            if(!model_class_names) {
                myToast2025("请输入模型目标", "error");
                $("#input_model_class_names").focus();
                return false;
            }
            
            if(!modelFile) {
                myToast2025("请上传模型文件", "error");
                $("#input_model_file").focus();
                return false;
            }
            
            // 验证文件大小
            let fileSize = modelFile.size;
            let fileSizeM = parseInt(fileSize / 1024 / 1024);
            if(fileSizeM > 1000) {
                myToast2025("模型文件不能超过1000M：" + fileSizeM + "M", "error");
                return false;
            }
            
            // 验证文件格式
            let fileName = modelFile.name;
            if(inference === 'TensorRT') {
                if(!fileName.endsWith('.onnx') && !fileName.endsWith('.engine')) {
                    myToast2025("TensorRT仅支持onnx或engine格式的模型", "error");
                    return false;
                }
            } else if(inference === 'OpenVINO') {
                if(!fileName.endsWith('.tar')) {
                    myToast2025("OpenVINO仅支持tar格式的模型", "error");
                    return false;
                }
            } else if(inference === 'ONNXRuntime') {
                if(!fileName.endsWith('.onnx')) {
                    myToast2025("ONNXRuntime仅支持onnx格式的模型", "error");
                    return false;
                }
            } else if(inference === 'Ascend') {
                if(!fileName.endsWith('.om')) {
                    myToast2025("Ascend仅支持om格式的模型", "error");
                    return false;
                }
            } else if(inference === 'RKNPU') {
                if(!fileName.endsWith('.rknn')) {
                    myToast2025("RKNPU仅支持rknn格式的模型", "error");
                    return false;
                }
            }
        }
        
        // 准备表单数据
        let formData = new FormData();
        formData.append('handle', currentModalMode);
        formData.append('code', currentModalMode === 'add' ? $("#form_code").val() : currentAlgorithmCode);
        formData.append('name', name);
        formData.append('algorithm_type', algorithm_type);
        formData.append('framework', framework);
        formData.append('inference', inference);
        formData.append('inference_device', inference_device);
        formData.append('extend_params', extend_params);
        formData.append('remark', '');
        
        if(currentModalMode === 'add') {
            formData.append('model_convert_params', $("#input_model_convert_params").val().trim());
            formData.append('model_class_names', $("#input_model_class_names").val().trim());
            formData.append('model', $("#input_model_file")[0].files[0]);
        }
        
        let url = currentModalMode === 'add' ? '/algorithm/openAdd' : '/algorithm/openEdit';
        
        isSubmitting = true;
        if (typeof ele_top_loading !== 'undefined') {
            ele_top_loading.show();
        }
        $("#submitBtn").prop('disabled', true);
        $("#submit_text").text('提交中...');
        $("#submit_loading").show();
        $("#submit_timer").show();
        
        // 开始计时
        startSubmitTimer();
        
        $.ajax({
            url: url,
            type: "post",
            async: true,
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            timeout: 0,
            error: function () {
                isSubmitting = false;
                if (typeof ele_top_loading !== 'undefined') {
                    ele_top_loading.hide();
                }
                $("#submitBtn").prop('disabled', false);
                $("#submit_text").text('提交');
                $("#submit_loading").hide();
                $("#submit_timer").hide();
                stopSubmitTimer();
                myToast2025("网络异常，请确定网络正常！", "error");
            },
            success: function (res) {
                isSubmitting = false;
                if (typeof ele_top_loading !== 'undefined') {
                    ele_top_loading.hide();
                }
                $("#submitBtn").prop('disabled', false);
                $("#submit_text").text('提交');
                $("#submit_loading").hide();
                stopSubmitTimer();
                
                // 显示最终耗时
                setTimeout(function() {
                    $("#submit_timer").hide();
                }, 2000);
                
                if(1000 === res.code) {
                    myToast2025(res.msg, "success");
                    closeAlgorithmModal();
                    setTimeout(function() {
                        window.location.reload();
                    }, 800);
                } else {
                    myToast2025(res.msg, "error");
                }
            }
        });
    };
    
    // 初始化时加载算法类型列表（用于编辑时显示名称）
    $(document).ready(function() {
        f_loadAlgorithmAddContext(function(data) {
            // 加载成功，algorithmTypes 已被设置
        });
    });
    
})();
