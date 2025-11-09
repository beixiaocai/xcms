// 摄像头弹窗管理
const streamModal = {
    mode: 'add', // add 或 edit
    currentCode: null,
    pullStreamTypes: [],
    audioTypes: [],
    
    // 初始化
    init: function() {
        // 绑定协议类型变化事件
        $('#stream_pull_type').on('change', () => {
            this.onPullTypeChange();
        });
    },
    
    // 协议类型变化
    onPullTypeChange: function() {
        const pullType = parseInt($('#stream_pull_type').val());
        
        if (pullType === 1) {
            $('#onvif_section').show();
        } else {
            $('#onvif_section').hide();
            
            // 只在添加模式下提示错误
            if (this.mode === 'add') {
                if (pullType === 0) {
                    myToast2025("请选择接入协议", "error");
                } else if (pullType === 21) {
                    myToast2025("如需接入GB28181，请到摄像头管理平台配置", "error");
                } else if (pullType === 31) {
                    myToast2025("如需接入cRTSP，请主动推流", "error");
                } else if (pullType === 32) {
                    myToast2025("如需接入cRTMP，请主动推流", "error");
                }
            }
        }
    },
    
    // 打开添加弹窗
    openAdd: function() {
        this.mode = 'add';
        this.currentCode = null;
        
        $('#stream_modal_title').text('添加摄像头');
        this.resetForm();
        
        // 加载默认参数
        this.loadAddContext();
        
        $('#stream_modal').addClass('active');
    },
    
    // 加载添加页面默认参数
    loadAddContext: function() {
        $.ajax({
            url: '/stream/openAddContext',
            type: 'get',
            dataType: 'json',
            success: (res) => {
                if (res.code === 1000) {
                    const stream = res.stream;
                    
                    // 设置默认编号
                    $('#stream_code').val(stream.code || '');
                    $('#stream_camera_device_id').val(stream.code || '');
                    
                    // 填充接入协议和音频类型选项
                    if (res.pull_stream_types) {
                        this.pullStreamTypes = res.pull_stream_types;
                        let pullTypeHtml = '<option value="0">请选择</option>';
                        res.pull_stream_types.forEach(item => {
                            pullTypeHtml += `<option value="${item.id}">${item.name}</option>`;
                        });
                        $('#stream_pull_type').html(pullTypeHtml);
                    }
                    
                    if (res.audio_types) {
                        this.audioTypes = res.audio_types;
                        let audioHtml = '';
                        res.audio_types.forEach(item => {
                            audioHtml += `<option value="${item.type}">${item.name}</option>`;
                        });
                        $('#stream_is_audio').html(audioHtml);
                        
                        // 设置默认音频类型（默认为 stream.is_audio 或第一个选项）
                        const defaultAudioType = stream.is_audio !== undefined ? stream.is_audio : (res.audio_types.length > 0 ? res.audio_types[0].type : 0);
                        $('#stream_is_audio').val(defaultAudioType);
                    }
                    
                    // 设置默认协议为RTSP
                    $('#stream_pull_type').val('1');
                    this.onPullTypeChange();
                    
                    // 填充默认ONVIF账号密码（从最后一条RTSP记录中获取）
                    if (stream.pull_stream_username) {
                        $('#stream_onvif_username').val(stream.pull_stream_username);
                    }
                    if (stream.pull_stream_password) {
                        $('#stream_onvif_password').val(stream.pull_stream_password);
                    }
                } else {
                    myToast2025(res.msg || '加载失败', 'error');
                }
            },
            error: () => {
                myToast2025('网络异常，请确定网络正常！', 'error');
            }
        });
    },
    
    // 打开编辑弹窗
    openEdit: function(code) {
        this.mode = 'edit';
        this.currentCode = code;
        
        $('#stream_modal_title').text('编辑摄像头');
        this.resetForm();
        
        // 加载数据
        this.loadData(code);
        
        $('#stream_modal').addClass('active');
    },
    
    // 加载数据
    loadData: function(code) {
        $.ajax({
            url: '/stream/openEditContext',
            type: 'get',
            data: { code: code },
            dataType: 'json',
            success: (res) => {
                if (res.code === 1000) {
                    const stream = res.stream;
                    
                    // 填充接入协议和音频类型选项
                    if (res.pull_stream_types) {
                        this.pullStreamTypes = res.pull_stream_types;
                        let pullTypeHtml = '<option value="0">请选择</option>';
                        res.pull_stream_types.forEach(item => {
                            pullTypeHtml += `<option value="${item.id}">${item.name}</option>`;
                        });
                        $('#stream_pull_type').html(pullTypeHtml);
                    }
                    
                    if (res.audio_types) {
                        this.audioTypes = res.audio_types;
                        let audioHtml = '';
                        res.audio_types.forEach(item => {
                            audioHtml += `<option value="${item.type}">${item.name}</option>`;
                        });
                        $('#stream_is_audio').html(audioHtml);
                    }
                    
                    // 填充表单数据
                    $('#stream_code').val(stream.code).prop('disabled', true);
                    $('#stream_camera_device_id').val(stream.camera_device_id || '');
                    $('#stream_nickname').val(stream.nickname || '');
                    $('#stream_pull_type').val(stream.pull_stream_type || 1);
                    $('#stream_pull_url').val(stream.pull_stream_url || '');
                    // 设置音频类型（确保正确处理 0 值）
                    $('#stream_is_audio').val(stream.is_audio !== undefined ? stream.is_audio : 0);
                    $('#stream_pull_ip').val(stream.pull_stream_ip || '');
                    $('#stream_camera_name').val(stream.camera_name || '');
                    $('#stream_camera_manufacturer').val(stream.camera_manufacturer || '');
                    $('#stream_remark').val(stream.remark || '');
                    
                    // 如果有ONVIF信息
                    if (stream.pull_stream_username) {
                        $('#stream_onvif_username').val(stream.pull_stream_username);
                    }
                    if (stream.pull_stream_password) {
                        $('#stream_onvif_password').val(stream.pull_stream_password);
                    }
                    
                    this.onPullTypeChange();
                } else {
                    myToast2025(res.msg || '加载失败', 'error');
                    this.close();
                }
            },
            error: () => {
                myToast2025('网络异常，请确定网络正常！', 'error');
                this.close();
            }
        });
    },
    
    // 重置表单
    resetForm: function() {
        $('#stream_form')[0].reset();
        $('#stream_code').prop('disabled', false);
        $('#onvif_section').hide();
    },
    
    // 关闭弹窗
    close: function() {
        $('#stream_modal').removeClass('active');
        this.resetForm();
    },
    
    // ONVIF探测
    detectOnvif: function() {
        const ip = $('#stream_onvif_ip').val().trim();
        const username = $('#stream_onvif_username').val().trim();
        const password = $('#stream_onvif_password').val().trim();
        
        if (!ip) {
            myToast2025("ONVIF IP不能为空", "error");
            return;
        }
        
        if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
            myToast2025("ONVIF IP格式不正确", "error");
            return;
        }
        
        if (!username) {
            myToast2025("ONVIF用户名不能为空", "error");
            return;
        }
        
        if (!password) {
            myToast2025("ONVIF密码不能为空", "error");
            return;
        }
        
        $.ajax({
            url: "/onvif/openCheckDevice",
            type: "post",
            data: { ip, username, password },
            dataType: "json",
            success: (res) => {
                if (res.code === 1000) {
                    const info = res.info;
                    const streamUri = info.streamUri;
                    const deviceInfo = info.deviceInfo;
                    
                    $('#stream_pull_url').val(streamUri || '');
                    $('#stream_pull_ip').val(ip);
                    $('#stream_camera_name').val(deviceInfo.HardwareId || '');
                    $('#stream_camera_manufacturer').val(deviceInfo.Manufacturer || '');
                    
                    const remark = `FirmwareVersion=${deviceInfo.FirmwareVersion || ''},Model=${deviceInfo.Model || ''},SerialNumber=${deviceInfo.SerialNumber || ''}`;
                    $('#stream_remark').val(remark);
                    
                    myToast2025("探测成功", "success");
                } else {
                    myToast2025(res.msg || '探测失败', "error");
                }
            },
            error: () => {
                myToast2025("网络异常，请确定网络正常！", "error");
            }
        });
    },
    
    // 验证表单
    validate: function() {
        const code = $('#stream_code').val().trim();
        if (!code) {
            myToast2025("请输入编号", "error");
            return false;
        }
        
        const nickname = $('#stream_nickname').val().trim();
        if (!nickname) {
            myToast2025("请输入名称", "error");
            return false;
        }
        
        const pullType = parseInt($('#stream_pull_type').val());
        if (pullType === 0) {
            myToast2025("请选择接入协议", "error");
            return false;
        }
        
        // 只在添加模式下限制特殊协议
        if (this.mode === 'add') {
            if (pullType === 21) {
                myToast2025("如需接入GB28181，请到摄像头管理平台配置", "error");
                return false;
            } else if (pullType === 31 || pullType === 32) {
                myToast2025("如需接入cRTSP/cRTMP，请主动推流", "error");
                return false;
            }
        }
        
        // 只对RTSP、RTMP、HTTP、HLS协议验证URL
        if (pullType === 1 || pullType === 2 || pullType === 3 || pullType === 4) {
            const pullUrl = $('#stream_pull_url').val().trim();
            if (!pullUrl) {
                myToast2025("请输入直播流地址", "error");
                return false;
            }
            
            // 验证URL格式
            if (pullType === 1) {
                if (!pullUrl.startsWith("rtsp://") && !pullUrl.startsWith("rtsps://")) {
                    myToast2025("直播流地址格式不正确", "error");
                    return false;
                }
            } else if (pullType === 2) {
                if (!pullUrl.startsWith("rtmp://") && !pullUrl.startsWith("rtmps://")) {
                    myToast2025("直播流地址格式不正确", "error");
                    return false;
                }
            } else if (pullType === 3 || pullType === 4) {
                if (!pullUrl.startsWith("http://") && !pullUrl.startsWith("https://")) {
                    myToast2025("直播流地址格式不正确", "error");
                    return false;
                }
            }
        }
        
        return true;
    },
    
    // 提交表单
    submit: function() {
        if (!this.validate()) {
            return;
        }
        
        const data = {
            code: $('#stream_code').val().trim(),
            app: 'live',
            name: this.mode === 'edit' ? this.currentCode : $('#stream_code').val().trim(),
            nickname: $('#stream_nickname').val().trim(),
            pull_stream_type: parseInt($('#stream_pull_type').val()),
            pull_stream_url: $('#stream_pull_url').val().trim(),
            pull_stream_ip: $('#stream_pull_ip').val().trim(),
            pull_stream_port: 0,
            camera_name: $('#stream_camera_name').val().trim(),
            camera_manufacturer: $('#stream_camera_manufacturer').val().trim(),
            camera_device_id: $('#stream_camera_device_id').val().trim(),
            remark: $('#stream_remark').val().trim(),
            onvif_username: $('#stream_onvif_username').val().trim(),
            onvif_password: $('#stream_onvif_password').val().trim(),
            is_audio: parseInt($('#stream_is_audio').val())
        };
        
        const url = this.mode === 'add' ? '/stream/openAdd' : '/stream/openEdit';
        
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            dataType: 'json',
            success: (res) => {
                if (res.code === 1000) {
                    myToast2025(res.msg || '操作成功', 'success');
                    this.close();
                    
                    // 刷新列表
                    setTimeout(() => {
                        if (typeof f_openIndex === 'function') {
                            f_openIndex(curPage, curPageSize);
                        } else {
                            window.location.reload();
                        }
                    }, 500);
                } else {
                    myToast2025(res.msg || '操作失败', 'error');
                }
            },
            error: () => {
                myToast2025('网络异常，请确定网络正常！', 'error');
            }
        });
    }
};
