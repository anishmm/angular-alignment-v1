import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { fromEvent } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'app-alignment',
  template: `
  <div class="button-bar">
    <button (click)="expandAll()">Expand All</button>
    <button (click)="collapseAll()">Collapse All</button>
    <button (click)="zoomFit( 500)">Fit</button>
  </div>

   <div  [style.font-size]='fontSize|async' class='wrapper' id='alignment'><span #marginDiv class='fade'>{{treeData?.title}}</span></div>`,
  styles: [
    `.wrapper{
    position:relative;
    max-width:960px;
    margin-left:auto;
    margin-right:auto;
  }
  .fade{
    display:inline-block;
    border:1px solid black;
    position:absolute;
    visibility:hidden;
  }
  .button-bar {
    margin-bottom: 10px;
  }
  .button-bar button{
    margin-right:10px;
  }
  `,
  ],
})
export class AlignmentComponent implements AfterViewInit {
  @Input() treeData: any = {};
  @Input() margin = { top: 0, right: 30, bottom: 0, left: 30 };
  @Input() duration = 750;

  @ViewChild('marginDiv') marginDiv: ElementRef | undefined;
  width: number = 0;
  height: number = 0;
  svg: any;
  root: any;
  nodeGroup: any;
  linkGroup: any;
  defs: any;
  zoom: any;
  scale: any;
  AVATAR_WIDTH: number = 30;
  i = 0;
  treeMap: any;
  rectNode: any = { width: 340, height: 160, textMargin: 5 };

  constructor(private el: ElementRef) {}

  fontSize = fromEvent(window, 'resize').pipe(
    startWith(null),
    map((_: any) => {
      return window.innerWidth > 960
        ? '14px'
        : (14 * 960) / window.innerWidth + 'px';
    }),
    tap((_: any) => {
      setTimeout(() => {
        const inc = this.marginDiv!.nativeElement.getBoundingClientRect().width;
        this.svg.attr(
          'transform',
          'translate(' + (this.margin.left + inc) + ',' + this.margin.top + ')'
        );
      });
    })
  );

  ngAfterViewInit(): void {
    const inc = this.marginDiv!.nativeElement.getBoundingClientRect().width;
    (this.width = 980 - inc - this.margin.left - this.margin.right),
      (this.height = 500 - this.margin.top - this.margin.bottom);

    this.zoom = d3.zoom<SVGSVGElement, unknown>();

    const horizontalSeparationBetweenNodes = 65;
    const verticalSeparationBetweenNodes = 10;

    this.svg = d3
      .select('#alignment')
      .append('svg')
      .attr('viewBox', '0 0 960 500')
      .call(this.zoom.transform, d3.zoomIdentity.translate(100, 50).scale(0.8))
      .call(
        this.zoom.on('zoom', (d: any) => {
          this.svg.attr('transform', d.transform);
        })
      )
      .append('g')
      .attr(
        'transform',
        'translate(' + (this.margin.left + inc) + ',' + this.margin.top + ')'
      );

    // declares a tree layout and assigns the size
    /*this.treeMap = d3.tree().nodeSize([this.rectNode.height + horizontalSeparationBetweenNodes,
    this.rectNode.width + verticalSeparationBetweenNodes])
      .separation(function (a, b) { return a.parent == b.parent ? 1 : 1.10; });*/

    this.treeMap = d3
      .tree()
      .nodeSize([this.height / 2, this.width / 2])
      .separation(function (a, b) {
        return a.parent == b.parent ? 1 : 1.1;
      });

    // Assigns parent, children, height, depth
    this.root = d3.hierarchy(this.treeData, (d: any) => {
      return d.children;
    });

    this.root.x0 = this.height / 2;
    this.root.y0 = 0;

    this.nodeGroup = this.svg.append('g').attr('id', 'nodes');
    this.linkGroup = this.svg.append('g').attr('id', 'links');
    this.defs = this.svg.append('defs');
    this.avatarMask();

    // Collapse after the second level
    this.root.children.forEach((d: any) => {
      this.collapse(d);
    });

    //
    this.update(this.root);
  }

  update(source: any) {
    // const rectNode = { width: 340, height: 160, textMargin: 5 };
    // Assigns the x and y position for the nodes
    const treeData = this.treeMap(this.root);

    // Compute the new tree layout.
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);
    const barHeight = 15,
      kraRowHeight = 15;
    const barWidth = this.rectNode.width - this.rectNode.width / 3;

    // Normalize for fixed-depth.
    nodes.forEach((d: any) => {
      d.y = d.depth * (this.rectNode.width * 1.5);
    });

    // ****************** Nodes section ***************************

    // Update the nodes...
    const node = this.nodeGroup.selectAll('g.node').data(nodes, (d: any) => {
      return d.id || (d.id = ++this.i);
    });

    // Enter any new modes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
      })
      .on('click', (_: any, d: any) => this.click(d));

    let kraHeight = 0;

    let topGroup = nodeEnter.append('g').attr('class', 'top-area');
    topGroup
      .append('rect')
      .attr('rx', 15)
      .attr('ry', 15)
      .attr('width', this.rectNode.width)
      .attr('height', (d: any) => {
        let kraCount = d.data.kra.length ?? 0;

        /*if (kraCount > 1) {
          console.log("-----------");
          d.data.kra.forEach((kra: any) => {
            console.log("d.value",kra.value)
            var width = this.BrowserText(kra.value);
            console.log("width", width);
          });
        }*/
        return this.rectNode.height + kraCount * kraRowHeight;
      })
      .attr('class', 'node-rect')
      .attr('fill', (d: any) => {
        return d.data.fill;
      });

    topGroup
      .append('path')
      .attr(
        'd',
        'M 90.484375,-0 H 13.253083 c -16.2914325,0 -13.26978675,22.961293 -13.26978675,22.961293 13.27639575,0.167086 76.88805875,0.293924 76.88805875,0.293924 6.178488,0.231044 12.962978,-2.299173 13.336816,-14.350969 z'
      )
      .style('fill', (d: any) => {
        return '#C2CCF7';
      });

    topGroup
      .append('text')
      .attr('class', 'company')
      .attr('x', this.rectNode.textMargin)
      .attr('y', 15)
      .text((d: any) => {
        return d.data.title;
      });

    topGroup
      .append('path')
      .attr(
        'd',
        'm 291.76165,-0 h 32.51573 c 7.31604,0 7.31604,0 10.56761,1.101508 5.69025,2.937354 4.87736,9.5464 4.87736,9.5464 v 21.419364 h -35.24637 c -6.73401,0 -12.1934,-4.931597 -12.1934,-11.015077 z'
      )
      .style('fill', '#ed481c');

    topGroup
      .append('text')
      .attr('class', 'percentage')
      .attr('x', this.rectNode.width - 40)
      .attr('y', 20)
      .text((d: any) => {
        return d.data.percent + '%';
      });

    topGroup
      .append('foreignObject')
      .attr('x', this.rectNode.textMargin)
      .attr('y', this.rectNode.textMargin + 20)
      .attr('width', () => {
        return this.rectNode.width - this.rectNode.textMargin * 2 < 0
          ? 0
          : this.rectNode.width - this.rectNode.textMargin * 2;
      })
      .attr('height', (d: any) => {
        let kraCount = d.data.kra.length ?? 0;

        let textHeight =
          this.rectNode.height - this.rectNode.textMargin * 2 < 0
            ? 0
            : this.rectNode.height - this.rectNode.textMargin * 2;
        textHeight = textHeight + kraCount * kraRowHeight;

        return textHeight;
      })
      .append('xhtml')
      .html((d: any) => {
        let txtKras = '';
        d.data.kra.forEach((kra: any) => {
          txtKras = txtKras + '<div class="kra">' + kra.value + '</div>';
        });
        return (
          '<div style="width: ' +
          (this.rectNode.width - this.rectNode.textMargin * 2) +
          'px; height: ' +
          (this.rectNode.height - this.rectNode.textMargin * 2) +
          'px;" class="wordwrap">' +
          '<div class="objective">' +
          d.data.obj +
          '</div>' +
          txtKras +
          '</div>'
        );
      });

    nodeEnter
      .append('svg:image')
      .attr('xlink:href', (d: any) => {
        return d.data.img;
      })
      .attr(
        'x',
        this.rectNode.width - this.AVATAR_WIDTH - this.AVATAR_WIDTH / 2
      )
      .attr(
        'y',
        this.rectNode.height - (this.AVATAR_WIDTH * 2 + this.AVATAR_WIDTH / 2)
      )
      .attr('width', this.AVATAR_WIDTH)
      .attr('height', this.AVATAR_WIDTH)
      .attr('clip-path', (d: any) => {
        return 'url(#avatar-clip)';
      });

    var graphGroup = nodeEnter
      .append('g')
      .attr('x', this.rectNode.textMargin)
      .attr('y', (d: any) => {
        var kraCount = d.data.kra.length ?? 0;
        return this.rectNode.height + kraCount * kraRowHeight - barHeight;
      });

    graphGroup
      .append('rect')
      .attr('x', this.rectNode.textMargin)
      .attr('y', (d: any) => {
        var kraCount = d.data.kra.length ?? 0;
        return this.rectNode.height + kraCount * kraRowHeight - barHeight;
      })
      .attr('width', barWidth)
      .attr('rx', '4')
      .attr('height', '8')
      .style('fill', '#E6E6E6');

    graphGroup
      .append('rect')
      .attr('x', this.rectNode.textMargin)
      .attr('y', (d: any) => {
        var kraCount = d.data.kra.length ?? 0;
        return this.rectNode.height + kraCount * kraRowHeight - barHeight;
      })
      .attr('width', (d: any) => {
        var per =
          d.data.percent > 100 ? 100 : d.data.percent <= 1 ? 1 : d.data.percent;
        return per * 2.5;
      })
      .attr('rx', '4')
      .attr('height', '8')
      .style('fill', '#F65D34');

    graphGroup
      .append('text')
      .attr('class', 'minValue')
      .attr('x', this.rectNode.textMargin)
      .attr('y', (d: any) => {
        var kraCount = d.data.kra.length ?? 0;
        return this.rectNode.height + kraCount * kraRowHeight - (barHeight + 8);
      })
      .text((d: any) => {
        return d.data.minValue;
      })
      .style('fill', '#8C8C8C');

    graphGroup
      .append('text')
      .attr('class', 'maxValue')
      .attr('x', (d: any) => {
        return (
          barWidth - this.BrowserText(d.maxValue) + this.rectNode.textMargin
        );
      })
      .attr('y', (d: any) => {
        var kraCount = d.data.kra.length ?? 0;
        return this.rectNode.height + kraCount * kraRowHeight - (barHeight + 8);
      })
      .text((d: any) => {
        return d.data.maxValue;
      })
      .style('fill', (d: any) => {
        return '#8C8C8C';
      });

    graphGroup
      .append('text')
      .attr('class', 'kra-value')
      .attr('x', (d: any) => {
        return (
          barWidth / 2 -
          this.BrowserText(d.value) / 2 +
          this.rectNode.textMargin
        );
      })
      .attr('y', (d: any) => {
        var kraCount = d.data.kra.length ?? 0;
        return (
          this.rectNode.height + kraCount * kraRowHeight - (barHeight + 10)
        );
      })
      .text((d: any) => {
        return d.data.value;
      });

    graphGroup
      .append('text')
      .attr('class', 'view-link')
      .attr('x', this.rectNode.width - 55)
      .attr('y', (d: any) => {
        var kraCount = d.data.kra.length ?? 0;
        return (
          this.rectNode.height + kraCount * kraRowHeight - (barHeight + 15)
        );
      })
      .text((d: any) => {
        return 'VIEW';
      })
      .on('click', (d: any) => {
        // window.open("http://google.com", '_blank').focus();
      });

    // Add Circle for the nodes
    /* nodeEnter
       .append('circle')
       .attr('class', (d: any) => (d._children ? 'node fill' : 'node'))
       .attr('r', 1e-6);
     // Add labels for the nodes
     nodeEnter
       .append('text')
       .attr('dy', '.35em')
 
       .attr('x', (d: any) => {
         return d.children || d._children ? -13 : 13;
       })
       .attr('text-anchor', (d: any) => {
         return d.children || d._children ? 'end' : 'start';
       })
       .text((d: any) => {
         return d.data.title;
       });*/

    // UPDATE
    const nodeUpdate = nodeEnter.merge(node);
    // Transition to the proper position for the node
    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => {
        return 'translate(' + d.y + ',' + d.x + ')';
      });
    nodeUpdate
      .select('rect')
      .attr('class', (d: any) => {
        return d._children ? 'node-rect-closed' : 'node-rect';
      })
      .attr('cursor', 'pointer');

    // Update the node attributes and style
    // nodeUpdate.select('circle.node').attr('r', 10).attr('class', (d: any) => (d._children ? 'node fill' : 'node')).attr('cursor', 'pointer');

    // Remove any exiting nodes
    const nodeExit = node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => {
        return 'translate(' + source.y + ',' + source.x + ')';
      })
      .remove();

    // On exit reduce the node circles size to 0
    // nodeExit.select('circle').attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text').style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    const link = this.linkGroup.selectAll('path').data(links, (d: any) => {
      return d.id;
    });

    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('class', (d: any) => {
        return d.data.precise ? 'precise-link' : 'link';
      })
      .attr('id', (d: any) => {
        return 'linkID' + d.data.id;
      })
      .attr('marker-end', 'url(#end-arrow)')
      .attr('d', (d: any) => {
        const o = { x: source.x0, y: source.y0 };
        return this.diagonal(o, o);
      });

    // UPDATE
    const linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(this.duration)
      .attr('d', (d: any) => {
        const resNew = d.parent.data.kra.some((item: any) => {
          if (
            item.id !== null &&
            item.id !== undefined &&
            d.data.parentId !== null &&
            d.data.parentId !== undefined &&
            item.id.toString() === d.data.parentId.toString()
          ) {
            return true;
          } else {
            return false;
          }
        });
        if (resNew) {
          var gap = 35;
          d.parent.data.kra.forEach((item: any, index: any) => {
            if (item.id === d.data.parentId) {
              gap = gap + index * 25;
            }
          });
          return this.diagonal(d, d.parent, gap);
        } else {
          return this.diagonal(d, d.parent);
        }
      });

    // Remove any exiting links
    let linkExit = link
      .exit()
      .transition()
      .duration(this.duration)
      .attr('d', (d: any) => {
        const o = { x: source.x, y: source.y };
        return this.diagonal(o, o);
      })
      .remove();

    linkExit.select('path').style('fill-opacity', 1e-6);

    // Store the old positions for transition.
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  collapse(d: any) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach((d: any) => this.collapse(d));
      d.children = null;
    }
  }

  click(d: any) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.update(d);
  }

  diagonal(s: any, d: any, e: any = 0) {
    let p0 = {
        x: s.x + (this.rectNode.height - e) / 2,
        y: s.y,
      },
      p3 = {
        x: d.x + this.rectNode.height / 5,
        y: d.y + this.rectNode.width - 0, // -12, so the end arrows are just before the rect node
      },
      m = (p0.y + p3.y) / 2,
      p = [p0, { x: p0.x, y: m }, { x: p3.x, y: m }, p3];
    const pp = p.map(function (d) {
      return [d.y, d.x + e];
    });
    return 'M' + pp[0] + 'C' + pp[1] + ' ' + pp[2] + ' ' + pp[3];
  }

  avatarMask() {
    const avatarRadius = this.AVATAR_WIDTH / 2;
    this.defs
      .append('clipPath')
      .attr('id', (d: any) => {
        return 'avatar-clip';
      })
      .append('circle')
      .attr('cx', this.rectNode.width - this.AVATAR_WIDTH)
      .attr('cy', this.rectNode.height - this.AVATAR_WIDTH * 2)
      .attr('r', avatarRadius);
  }

  BrowserText(text: any) {
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');
    var width = context!.measureText(text).width;
    return width;
  }

  expand(d) {
    var children = d.children ? d.children : d._children;
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
    if (children) children.forEach((d: any) => this.expand(d));
    //if (children) children.forEach(this.expand);
  }

  expandAll() {
    this.expand(this.root);
    this.update(this.root);
  }
  collapseAll() {
    this.collapse(this.root);
    this.update(this.root);
  }

  zoomFit(transitionDuration) {
    var bounds = this.svg.node().getBBox();
    var parent = this.svg.node().parentElement;
    var fullWidth = parent.clientWidth || parent.parentNode.clientWidth,
      fullHeight = parent.clientHeight || parent.parentNode.clientHeight;
    var width = bounds.width,
      height = bounds.height;
    var midX = bounds.x + width / 2,
      midY = bounds.y + height / 2;
    if (width == 0 || height == 0) return; // nothing to fit
    this.scale = 0.9 / Math.max(width / fullWidth, height / fullHeight);
    var translate = [
      fullWidth / 2 - this.scale * midX,
      fullHeight / 2 - this.scale * midY,
    ];

    this.zoom.scaleTo(
      this.svg.transition(translate).duration(transitionDuration || 0),
      this.scale
    );
  }
}
