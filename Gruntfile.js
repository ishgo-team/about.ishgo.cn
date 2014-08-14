

module.exports = function(grunt) {
  'use strict';

  var config = {
    pkg: grunt.file.readJSON('package.json'),

    // 无损压缩
    imagemin: {
      minify: {
        options: { optimizationLevel: 3 },
        files: [
          { dest: 'assets/ico/', cwd: 'src/assets/ico/', src: ['*.{png,jpg,gif}'], expand: true },
          { dest: 'assets/images/', cwd: 'src/assets/images/', src: ['*.{png,jpg,gif}'], expand: true }
        ]
      }
    },

    // 编译 css 文件
    less: {
      compile: {
        options: { paths: ['src/assets/less/app/'], compress: true, yuicompress: true },
        files: { 'assets/css/app.min.css': 'src/assets/less/app/app.less'}
      }
    },

    // TODO: 使用 cofficscript，更加优化代码效率规范等

    // 合并文件，减少请求数
    concat: {
      options: {
        separator: ';'
      },
      pkg: {
        files: [
          {
            dest: 'scripts/app.min.js',
            src: [
              'src/scripts/app/conf/*.js',
              'src/scripts/app/libs/*.js',
              'src/scripts/app/modules/*.js',
              'src/scripts/app/public/*.js',
              'src/scripts/app/pages/*.js'
            ]
          }
        ]
      },
      ui: {
        files: [
          {
            dest: 'scripts/app.ui.min.js',
            src: [
              'src/scripts/ui/app.js',
              'src/scripts/ui/*.js'
            ]
          }
        ]
      }
    },

    // 压缩脚本文件，发布版本时进行一次脚本压缩
    uglify: {
      minify: {
        files: [
          { dest: 'scripts/', cwd: 'scripts/', src: ['*.js', '*/*.js'], expand: true }
        ]
      }
    },

    // 复制不需要编译的文件，awesome, bootstrap 这类型再编译反而增加打包时间
    // 因此只需直接引用，或将其放置 CDN 上加速.
    copy: {
      panel: {
        files: [
          { dest: 'assets/fonts/', cwd: 'src/assets/fonts/', src: ['**'], expand: true },
          { dest: 'assets/ico/', cwd: 'src/assets/ico/', src: ['**'], expand: true },
          { dest: 'assets/css/', cwd: 'src/assets/css/', src: ['**'], expand: true }
        ]
      },
      script: {
        files: [
          { dest: 'scripts/libs/', cwd: 'src/scripts/libs/', src: ['**'], expand: true }
        ]
      }
    },

    // 清理文件，每次发布文件都必须清理多余或废版本文件，达到最简洁目录
    clean: {
      dist: ['./assets', './scripts', './views'],
      build: ['./_build']
    },

    // 获取文件版本信息
    hashmap: {
      options: {
      	keep: false,
        output: '_build/hashmap.json',
        rename: '#{= dirname}/#{= basename}.#{= hash}#{= extname}'
      },
      version: {
        files: [
          { dest: './', cwd: './', src: ['scripts/**', 'assets/css/**'] }
        ]
      }
    },

    // 使用 jade 文件编译成 html
    jade: {
      options: {
        data: function() {
          var map, make;

         	try {  map = grunt.file.readJSON('_build/hashmap.json'); }
         	catch (e) { map = {}; }

          make = function(file) {
            var token, hash, reg, ext, dir, name, path;
            for (token in map) {
              reg = new RegExp(token + '$');

              // 匹配文件名称，将 hash 值作为版本号添加入路径中
              if (reg.test(file)) {
                dir = file.replace(reg, '');
                ext = /[.]/.exec(file) ? /[^.]+$/.exec(file) : undefined;
                name = token.replace(new RegExp('.' + ext + '$'), '');
                hash = map[token];
                path = dir + name + '.' + hash + '.' + ext;
                break;
              }
            }

            return path || file;
          };

          return { pkg: config.pkg, makeVersion: make };
        }
      },
      pages: {
        files: [
          { dest: 'views/', cwd: 'src/assets/jade/pages/', src: ['*'], ext: '.html', expand: true },
          { dest: 'assets/templates/', cwd: 'src/assets/jade/templates/', src: ['{*,*/*}.jade'], ext: '.html', expand: true },
          { dest: 'assets/svg/', cwd: 'src/assets/jade/svg/', src: ['{*,*/*}.jade'], ext: '.svg', expand: true }
        ]
      }
    },

    // TODO: 单元测试
    // karma: {
    //   unit: {
    //     configFile: 'test/karma.conf.js',
    //     background: false
    //   }
    // },

    watch: {
      public: {
        files: ['src/assets/ico/**', 'src/assets/images/**', 'src/assets/fonts/**', 'src/scripts/libs/**', 'src/scripts/ui/**'],
        tasks: ['imagemin', 'copy:panel', 'copy:script']
      },
      less: {
        files: ['src/assets/less/app/**'],
        tasks: ['less:compile']
      },
      jade: {
        files: ['src/assets/jade/**'],
        tasks: ['jade']
      },
      script: {
        files: ['src/scripts/**'],
        tasks: ['concat']
      }
    }
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-hashmap');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('style', ['imagemin', 'copy:panel', 'less']);
  grunt.registerTask('script', ['concat']);
  grunt.registerTask('render', ['jade']);

  grunt.registerTask('package', ['copy:panel', 'copy:script']);
  grunt.registerTask('compile', ['clean', 'style', 'script', 'package']);

  grunt.registerTask('test', ['karma']);
  grunt.registerTask('release', ['compile', 'uglify', 'hashmap', 'render', 'clean:build']);
  grunt.registerTask('default', ['compile', 'render', 'clean:build', 'watch']);
};