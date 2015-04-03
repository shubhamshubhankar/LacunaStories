<?php
/**
 * @file
 * lacuna_stories_content_types.context.inc
 */

/**
 * Implements hook_context_default_contexts().
 */
function lacuna_stories_content_types_context_default_contexts() {
  $export = array();

  $context = new stdClass();
  $context->disabled = FALSE; /* Edit this to true to make a default context disabled initially */
  $context->api_version = 3;
  $context->name = 'annotation_filters';
  $context->description = 'Annotation Filters';
  $context->tag = 'materials';
  $context->conditions = array(
    'node' => array(
      'values' => array(
        'blog' => 'blog',
        'document' => 'document',
        'image' => 'image',
        'music_video' => 'music_video',
        'video' => 'video',
      ),
      'options' => array(
        'node_form' => '0',
      ),
    ),
  );
  $context->reactions = array(
    'block' => array(
      'blocks' => array(
        'block-1' => array(
          'module' => 'block',
          'delta' => '1',
          'region' => 'sidebar_second',
          'weight' => '-10',
        ),
      ),
    ),
  );
  $context->condition_mode = 0;

  // Translatables
  // Included for use with string extractors like potx.
  t('Annotation Filters');
  t('materials');
  $export['annotation_filters'] = $context;

  $context = new stdClass();
  $context->disabled = FALSE; /* Edit this to true to make a default context disabled initially */
  $context->api_version = 3;
  $context->name = 'stitchings_edit';
  $context->description = 'Show stitchings for a thread, on edit form';
  $context->tag = 'thread';
  $context->conditions = array(
    'node' => array(
      'values' => array(
        'thread' => 'thread',
      ),
      'options' => array(
        'node_form' => '2',
      ),
    ),
  );
  $context->reactions = array(
    'block' => array(
      'blocks' => array(
        'views-stitchings-block' => array(
          'module' => 'views',
          'delta' => 'stitchings-block',
          'region' => 'help',
          'weight' => '-10',
        ),
      ),
    ),
  );
  $context->condition_mode = 0;

  // Translatables
  // Included for use with string extractors like potx.
  t('Show stitchings for a thread, on edit form');
  t('thread');
  $export['stitchings_edit'] = $context;

  return $export;
}