// Generated by CoffeeScript 1.11.1
(function() {
  var $,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  $ = jQuery;

  Annotator.Plugin.PDF = (function(superClass) {
    extend(PDF, superClass);

    function PDF() {
      this.onPDFHighlightMouseover = bind(this.onPDFHighlightMouseover, this);
      return PDF.__super__.constructor.apply(this, arguments);
    }

    PDF.prototype.ANNOTATION_LAYER_MARKUP = '<div class="pdf-annotation-layer"></div>';

    PDF.prototype.ANNOTATION_MARKUP = '<div class="pdf-annotation annotator-hl"></div>';

    PDF.prototype.DRAG_THRESHOLD = 5;

    PDF.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      this.subscribe('annotationsLoaded', (function(_this) {
        return function(annotations) {
          return _this.annotations = annotations;
        };
      })(this));
      this.subscribe('annotationDeleted', (function(_this) {
        return function(annotation) {
          var index;
          annotation.$element.remove();
          index = _this.annotations.indexOf(annotation);
          return _this.annotations.splice(index, 1);
        };
      })(this));
      this.listenForEditorEvents();
      Drupal.PDFDocumentView.loaded.then((function(_this) {
        return function() {
          var app, pdfPages;
          app = Drupal.PDFDocumentView.PDFViewerApplication;
          _this.viewerElement = app.pdfViewer.viewer;
          pdfPages = app.pdfViewer._pages;
          _this.annotationLayers = [];
          return _this.viewerElement.addEventListener('pagerendered', function(event) {
            var pageNumber, pageView;
            pageNumber = event.detail.pageNumber;
            pageView = pdfPages[pageNumber - 1];
            return _this.enableAnnotationsOnPage(pageNumber, pageView);
          });
        };
      })(this));
      return this.handlePDFAnnotationCreationEvents();
    };

    PDF.prototype.listenForEditorEvents = function() {
      this.editing = false;
      this.subscribe('annotationEditorShown', (function(_this) {
        return function() {
          $(_this.viewerElement.parentElement).css({
            overflow: 'hidden'
          });
          $(_this.viewerElement).addClass('editor-open');
          return _this.editing = true;
        };
      })(this));
      return this.subscribe('annotationEditorHidden', (function(_this) {
        return function() {
          $(_this.viewerElement.parentElement).css({
            overflow: 'auto'
          });
          $(_this.viewerElement).removeClass('editor-open');
          return _this.editing = false;
        };
      })(this));
    };

    PDF.prototype.enableAnnotationsOnPage = function(pageNumber, pageView) {
      var annotationLayer;
      annotationLayer = this.createAnnotationLayer(pageView);
      this.drawExistingAnnotations(pageNumber, pageView, annotationLayer);
      return this.listenForAnnotationCreation(pageNumber, pageView, annotationLayer);
    };

    PDF.prototype.createAnnotationLayer = function(pageView) {
      var annotationLayer;
      annotationLayer = $(this.ANNOTATION_LAYER_MARKUP)[0];
      pageView.div.appendChild(annotationLayer);
      return annotationLayer;
    };

    PDF.prototype.drawExistingAnnotations = function(pageNumber, pageView, annotationLayer) {
      return this.annotations.forEach((function(_this) {
        return function(annotation) {
          var $annotationElement, height, ref, ref1, ref2, ref3, ref4, v, width, x1, x1Pdf, x2, x2Pdf, y1, y1Pdf, y2, y2Pdf;
          if (annotation.pdfRange && annotation.pdfRange.pageNumber === pageNumber) {
            $annotationElement = $(_this.ANNOTATION_MARKUP);
            ref = annotation.pdfRange, x1Pdf = ref.x1Pdf, y1Pdf = ref.y1Pdf, x2Pdf = ref.x2Pdf, y2Pdf = ref.y2Pdf;
            v = pageView.viewport;
            ref1 = [[x1Pdf, y1Pdf], [x2Pdf, y2Pdf]].map(function(arg) {
              var x, y;
              x = arg[0], y = arg[1];
              return v.convertToViewportPoint(x, y);
            }), (ref2 = ref1[0], x1 = ref2[0], y1 = ref2[1]), (ref3 = ref1[1], x2 = ref3[0], y2 = ref3[1]);
            ref4 = [x2 - x1, y2 - y1], width = ref4[0], height = ref4[1];
            $annotationElement.css({
              left: x1,
              top: y1,
              width: width,
              height: height
            });
            _this.linkAnnotationElement($annotationElement, annotation);
            return $(annotationLayer).append($annotationElement);
          }
        };
      })(this));
    };

    PDF.prototype.linkAnnotationElement = function($annotationElement, annotation) {
      var THROTTLE_MS, throttling;
      annotation.$element = $annotationElement;
      $annotationElement.data('annotation', annotation);
      THROTTLE_MS = 250;
      throttling = false;
      $annotationElement.on('mousemove', (function(_this) {
        return function(event) {
          if (!throttling) {
            _this.onPDFHighlightMouseover(event);
            throttling = true;
            return setTimeout((function() {
              return throttling = false;
            }), THROTTLE_MS);
          }
        };
      })(this));
      return $annotationElement.on('mouseout', this.annotator.startViewerHideTimer);
    };

    PDF.prototype.listenForAnnotationCreation = function(pageNumber, pageView, annotationLayer) {
      var mouseDown, mousedownCoordinates;
      mouseDown = false;
      this.dragging = false;
      mousedownCoordinates = null;
      return $(annotationLayer).on('mousedown mousemove mouseup', (function(_this) {
        return function(event) {
          var coordinates, eventParameters, rect;
          if (!_this.editing) {
            rect = annotationLayer.getBoundingClientRect();
            coordinates = {
              x: event.clientX - rect.x,
              y: event.clientY - rect.y
            };
            eventParameters = {
              pageNumber: pageNumber,
              pageView: pageView,
              annotationLayer: annotationLayer,
              coordinates: coordinates
            };
            if (event.type === 'mousedown') {
              mouseDown = true;
              mousedownCoordinates = coordinates;
            }
            if (event.type === 'mouseup') {
              mouseDown = false;
              mousedownCoordinates = null;
              if (_this.dragging) {
                _this.dragging = false;
                _this.publish('pdf-dragend', eventParameters);
              } else {
                _this.publish('pdf-click', eventParameters);
              }
            }
            if (mouseDown && event.type === 'mousemove') {
              if (!_this.dragging) {
                if (_this.checkDragThreshold(coordinates, mousedownCoordinates)) {
                  _this.dragging = true;
                  return _this.publish('pdf-dragstart', eventParameters);
                }
              } else {
                return _this.publish('pdf-dragmove', eventParameters);
              }
            }
          }
        };
      })(this));
    };

    PDF.prototype.checkDragThreshold = function(current, down) {
      var x, y;
      x = current.x > down.x + this.DRAG_THRESHOLD || current.x < down.x - this.DRAG_THRESHOLD;
      y = current.y > down.y + this.DRAG_THRESHOLD || current.y < down.y - this.DRAG_THRESHOLD;
      return x || y;
    };

    PDF.prototype.handlePDFAnnotationCreationEvents = function() {
      var $newAnnotationElement, pageNumber, startCoordinates;
      $newAnnotationElement = null;
      pageNumber = null;
      startCoordinates = null;
      this.subscribe('pdf-dragstart', (function(_this) {
        return function(eventParameters) {
          pageNumber = eventParameters.pageNumber;
          startCoordinates = eventParameters.coordinates;
          $newAnnotationElement = $(_this.ANNOTATION_MARKUP).addClass('new-annotation');
          $newAnnotationElement.css({
            left: eventParameters.coordinates.x,
            top: eventParameters.coordinates.y
          });
          return $(eventParameters.annotationLayer).append($newAnnotationElement);
        };
      })(this));
      this.subscribe('pdf-dragmove', (function(_this) {
        return function(eventParameters) {
          var height, width;
          width = eventParameters.coordinates.x - startCoordinates.x;
          height = eventParameters.coordinates.y - startCoordinates.y;
          return $newAnnotationElement.css({
            width: (width > 0 ? width : 0),
            height: (height > 0 ? height : 0)
          });
        };
      })(this));
      return this.subscribe('pdf-dragend', (function(_this) {
        return function(eventParameters) {
          var heightPdf, pdfRange, ref, ref1, ref2, ref3, v, widthPdf, x1Pdf, x2Pdf, y1Pdf, y2Pdf;
          v = eventParameters.pageView.viewport;
          ref = [[startCoordinates.x, startCoordinates.y], [eventParameters.coordinates.x, eventParameters.coordinates.y]].map(function(arg) {
            var x, y;
            x = arg[0], y = arg[1];
            return v.convertToPdfPoint(x, y);
          }), (ref1 = ref[0], x1Pdf = ref1[0], y1Pdf = ref1[1]), (ref2 = ref[1], x2Pdf = ref2[0], y2Pdf = ref2[1]);
          ref3 = [x2Pdf - x1Pdf, y2Pdf - y1Pdf], widthPdf = ref3[0], heightPdf = ref3[1];
          if (widthPdf > 0 && heightPdf < 0) {
            pdfRange = {
              pageNumber: pageNumber,
              x1Pdf: x1Pdf,
              y1Pdf: y1Pdf,
              x2Pdf: x2Pdf,
              y2Pdf: y2Pdf
            };
            _this.editNewAnnotation(pdfRange, $newAnnotationElement);
          } else {
            $newAnnotationElement.remove();
          }
          $newAnnotationElement = null;
          pageNumber = null;
          return startCoordinates = null;
        };
      })(this));
    };

    PDF.prototype.editNewAnnotation = function(pdfRange, $newAnnotationElement) {
      var annotation, bottom, cancel, cleanup, editorLocation, left, ref, right, save, top;
      annotation = this.annotator.createAnnotation();
      annotation.pdfRange = pdfRange;
      annotation.quote = [];
      annotation.ranges = [];
      annotation.highlights = [];
      save = (function(_this) {
        return function() {
          _this.publish('annotationCreated', [annotation]);
          $newAnnotationElement.removeClass('new-annotation');
          _this.linkAnnotationElement($newAnnotationElement, annotation);
          _this.annotations.push(annotation);
          return cleanup();
        };
      })(this);
      cancel = (function(_this) {
        return function() {
          $newAnnotationElement.remove();
          return cleanup();
        };
      })(this);
      cleanup = (function(_this) {
        return function() {
          _this.unsubscribe('annotationEditorHidden', cancel);
          return _this.unsubscribe('annotationEditorSubmit', save);
        };
      })(this);
      ref = $newAnnotationElement[0].getBoundingClientRect(), top = ref.top, left = ref.left, bottom = ref.bottom, right = ref.right;
      editorLocation = {
        top: (top + bottom) / 2,
        left: (left + right) / 2
      };
      this.subscribe('annotationEditorSubmit', save);
      this.subscribe('annotationEditorHidden', cancel);
      return this.annotator.showEditor(annotation, editorLocation);
    };

    PDF.prototype.onPDFHighlightMouseover = function(event) {
      var annotations, location;
      this.annotator.clearViewerHideTimer();
      if (this.dragging || this.editing) {
        return false;
      }
      if (this.annotator.viewer.isShown()) {
        this.annotator.viewer.hide();
      }
      annotations = this.getAnnotationsAtMouseLocation(event);
      location = {
        left: event.clientX,
        top: event.clientY
      };
      return this.annotator.showViewer(annotations, location);
    };

    PDF.prototype.getAnnotationsAtMouseLocation = function(event) {
      var CHECKED_CLASS, annotations, checked, clientX, clientY, element, parentDocument;
      clientX = event.clientX, clientY = event.clientY;
      parentDocument = event.target.ownerDocument;
      CHECKED_CLASS = 'under-mouse-position-checked';
      checked = [];
      annotations = [];
      while (true) {
        element = parentDocument.elementFromPoint(clientX, clientY);
        if (element.classList.contains('pdf-annotation-layer')) {
          break;
        }
        element.classList.add(CHECKED_CLASS);
        checked.push(element);
        if (element.classList.contains('pdf-annotation')) {
          annotations.push(element);
        }
      }
      Array.prototype.forEach.call(checked, (function(element) {
        return element.classList.remove(CHECKED_CLASS);
      }));
      return Array.prototype.map.call(annotations, (function(element) {
        return $(element).data('annotation');
      }));
    };

    return PDF;

  })(Annotator.Plugin);

}).call(this);
